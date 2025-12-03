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
          testType: z.enum(["recording", "noise_cancellation", "spectrum_analysis"]),
          duration: z.number().optional(),
          audioBlob: z.string().optional(), // Base64 encoded audio
          spectrumData: z.any().optional(),
          noiseLevel: z.number().optional(),
          quality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let audioUrl: string | undefined;

        // Upload audio to S3 if provided
        if (input.audioBlob) {
          const buffer = Buffer.from(input.audioBlob, "base64");
          const timestamp = Date.now();
          const fileKey = `audio-tests/${ctx.user.id}/${timestamp}.webm`;
          const result = await storagePut(fileKey, buffer, "audio/webm");
          audioUrl = result.url;
        }

        await createAudioTest({
          userId: ctx.user.id,
          deviceId: input.deviceId,
          testType: input.testType,
          duration: input.duration,
          audioUrl,
          spectrumData: input.spectrumData,
          noiseLevel: input.noiseLevel,
          quality: input.quality,
          notes: input.notes,
        });

        return { success: true, audioUrl };
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
        const script = scripts.find((s) => s.id === input.scriptId);

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
          prompt: z.string(),
          provider: z.enum(["openai", "anthropic", "gemini"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get API key from localStorage (passed from frontend)
        // In a real implementation, you would call the AI API here
        // For now, we'll create a placeholder response

        const response = "Diagnóstico de IA não implementado. Configure sua API Key nas configurações.";

        await createAIDiagnostic({
          userId: ctx.user.id,
          prompt: input.prompt,
          response,
          provider: input.provider || "openai",
          model: "gpt-4o",
          tokensUsed: 0,
        });

        return { response };
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
