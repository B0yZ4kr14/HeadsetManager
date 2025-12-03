import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  upsertAudioDevice,
  getAudioDevicesByUserId,
  createAudioTest,
  getAudioTestsByUserId,
  createSystemLog,
  getSystemLogsByUserId,
  getTroubleshootingScripts,
  createScriptExecution,
  updateScriptExecution,
  getScriptExecutionsByUserId,
  createAIDiagnostic,
  getAIDiagnosticsByUserId,
  updateAIDiagnosticFeedback,
} from "../db";
import { storagePut } from "../storage";
import { exec } from "child_process";
import { promisify } from "util";
import { analyzeLogsWithAI, suggestTroubleshooting } from "../services/openai";
import {
  emitSystemLog,
  emitScriptExecution,
  emitAIDiagnostic,
} from "../services/socket";

const execAsync = promisify(exec);

export const headsetRouter = router({
  // Audio Devices
  devices: router({
    upsert: protectedProcedure
      .input(
        z.object({
          deviceId: z.string(),
          label: z.string().optional(),
          kind: z.string(),
          groupId: z.string().optional(),
          manufacturer: z.string().optional(),
          driver: z.string().optional(),
          isUsb: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await upsertAudioDevice({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getAudioDevicesByUserId(ctx.user.id);
    }),
  }),

  // Audio Tests
  tests: router({
    create: protectedProcedure
      .input(
        z.object({
          deviceId: z.number().optional(),
          testType: z.enum([
            "recording",
            "noise_cancellation",
            "spectrum_analysis",
          ]),
          duration: z.number().optional(),
          audioBlob: z.string().optional(), // Base64 encoded audio
          spectrumData: z.any().optional(),
          noiseLevel: z.number().optional(),
          quality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Save only metadata to database (no audio file upload)
        await createAudioTest({
          userId: ctx.user.id,
          deviceId: input.deviceId,
          testType: input.testType,
          duration: input.duration,
          spectrumData: input.spectrumData,
          noiseLevel: input.noiseLevel,
          quality: input.quality,
          notes: input.notes,
        });

        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getAudioTestsByUserId(ctx.user.id, input.limit);
      }),
  }),

  // System Logs
  logs: router({
    create: protectedProcedure
      .input(
        z.object({
          level: z.enum(["info", "warning", "error", "debug"]),
          source: z.string(),
          message: z.string(),
          details: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createSystemLog({
          userId: ctx.user.id,
          ...input,
        });

        // Emit log via WebSocket
        emitSystemLog({
          level: input.level,
          source: input.source,
          message: input.message,
          details: input.details,
        });

        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getSystemLogsByUserId(ctx.user.id, input.limit);
      }),
  }),

  // Troubleshooting
  troubleshooting: router({
    listScripts: protectedProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input }) => {
        return await getTroubleshootingScripts(input.category);
      }),

    executeScript: protectedProcedure
      .input(z.object({ scriptId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const scripts = await getTroubleshootingScripts();
        const script = scripts.find(s => s.id === input.scriptId);

        if (!script) {
          throw new Error("Script not found");
        }

        // Create execution record
        await createScriptExecution({
          userId: ctx.user.id,
          scriptId: input.scriptId,
          status: "running",
        });

        // Get the most recent execution for this user and script
        const executions = await getScriptExecutionsByUserId(ctx.user.id, 1);
        const executionId = executions[0]?.id;
        const startTime = Date.now();

        try {
          // Execute command (SECURITY WARNING: In production, sanitize and whitelist commands)
          const { stdout, stderr } = await execAsync(script.command, {
            timeout: 30000, // 30 second timeout
          });

          const executionTime = Date.now() - startTime;

          await updateScriptExecution(executionId, {
            status: "success",
            output: stdout || stderr,
            executionTime,
            completedAt: new Date(),
          });

          // Emit success via WebSocket
          emitScriptExecution({
            scriptId: input.scriptId,
            scriptName: script.name,
            status: "success",
            output: stdout || stderr,
            executionTime,
          });

          return {
            success: true,
            output: stdout || stderr,
            executionTime,
          };
        } catch (error: any) {
          const executionTime = Date.now() - startTime;

          await updateScriptExecution(executionId, {
            status: "failed",
            errorMessage: error.message,
            output: error.stdout || error.stderr,
            executionTime,
            completedAt: new Date(),
          });

          // Emit failure via WebSocket
          emitScriptExecution({
            scriptId: input.scriptId,
            scriptName: script.name,
            status: "failed",
            errorMessage: error.message,
            output: error.stdout || error.stderr,
            executionTime,
          });

          throw new Error(`Script execution failed: ${error.message}`);
        }
      }),

    listExecutions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getScriptExecutionsByUserId(ctx.user.id, input.limit);
      }),
  }),

  // AI Diagnostics
  ai: router({
    diagnose: protectedProcedure
      .input(
        z.object({
          apiKey: z.string(),
          logs: z.array(z.string()),
          deviceInfo: z
            .object({
              manufacturer: z.string().optional(),
              driver: z.string().optional(),
              label: z.string().optional(),
            })
            .optional(),
          errorContext: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const analysis = await analyzeLogsWithAI(input.apiKey, {
            logs: input.logs,
            deviceInfo: input.deviceInfo,
            errorContext: input.errorContext,
          });

          const response = `**Diagnóstico:** ${analysis.diagnosis}\n\n**Ações Sugeridas:**\n${analysis.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n**Severidade:** ${analysis.severity} | **Confiança:** ${analysis.confidence}%`;

          await createAIDiagnostic({
            userId: ctx.user.id,
            prompt: `Análise de ${input.logs.length} logs`,
            response,
            provider: "openai",
            model: "gpt-4o-mini",
            tokensUsed: 0,
          });

          // Emit AI diagnostic via WebSocket
          emitAIDiagnostic({
            userId: ctx.user.id,
            response,
            severity: analysis.severity,
            confidence: analysis.confidence,
          });

          return {
            response,
            analysis,
          };
        } catch (error: any) {
          throw new Error(`Erro na análise de IA: ${error.message}`);
        }
      }),

    suggest: protectedProcedure
      .input(
        z.object({
          apiKey: z.string(),
          symptoms: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const suggestions = await suggestTroubleshooting(
            input.apiKey,
            input.symptoms
          );
          return { suggestions };
        } catch (error: any) {
          throw new Error(`Erro ao gerar sugestões: ${error.message}`);
        }
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getAIDiagnosticsByUserId(ctx.user.id, input.limit);
      }),

    feedback: protectedProcedure
      .input(
        z.object({
          diagnosticId: z.number(),
          wasHelpful: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateAIDiagnosticFeedback(input.diagnosticId, input.wasHelpful);
        return { success: true };
      }),
  }),
});
