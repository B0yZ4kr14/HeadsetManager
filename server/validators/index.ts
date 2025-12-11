/**
 * Centralized Validators Module
 * Todos os schemas Zod para validação de entrada
 */

import { z } from 'zod';

// ============================================================================
// Audio Device Validators
// ============================================================================

export const audioDeviceSchema = z.object({
  deviceId: z.string().min(1, 'Device ID é obrigatório'),
  label: z.string().optional(),
  kind: z.enum(['audioinput', 'audiooutput']),
  groupId: z.string().optional(),
  manufacturer: z.string().optional(),
  driver: z.string().optional(),
  isUsb: z.boolean().optional(),
});

export type AudioDevice = z.infer<typeof audioDeviceSchema>;

// ============================================================================
// Audio Test Validators
// ============================================================================

export const audioTestSchema = z.object({
  deviceId: z.number().optional(),
  testType: z.enum(['recording', 'noise_cancellation', 'spectrum_analysis']),
  duration: z.number().positive('Duração deve ser positiva').optional(),
  audioBlob: z.string().optional(),
  spectrumData: z.any().optional(),
  noiseLevel: z.number().min(0).max(255).optional(),
  quality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
});

export type AudioTest = z.infer<typeof audioTestSchema>;

// ============================================================================
// System Log Validators
// ============================================================================

export const systemLogSchema = z.object({
  level: z.enum(['info', 'warning', 'error', 'debug']),
  source: z.enum(['frontend', 'backend', 'driver', 'system']),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  details: z.any().optional(),
});

export type SystemLog = z.infer<typeof systemLogSchema>;

// ============================================================================
// Troubleshooting Script Validators
// ============================================================================

export const troubleshootingScriptSchema = z.object({
  scriptId: z.number().positive('Script ID deve ser positivo'),
  params: z.record(z.string()).optional(),
});

export type TroubleshootingScript = z.infer<typeof troubleshootingScriptSchema>;

// ============================================================================
// Pagination Validators
// ============================================================================

export const paginationSchema = z.object({
  limit: z.number().positive().max(100).optional().default(50),
  offset: z.number().nonnegative().optional().default(0),
});

export type Pagination = z.infer<typeof paginationSchema>;

// ============================================================================
// Error Response Validators
// ============================================================================

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================================================
// Success Response Validators
// ============================================================================

export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validar dados com schema Zod
 */
export async function validateData<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validar dados de forma síncrona
 */
export function validateDataSync<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export default {
  audioDeviceSchema,
  audioTestSchema,
  systemLogSchema,
  troubleshootingScriptSchema,
  paginationSchema,
  errorResponseSchema,
  successResponseSchema,
  validateData,
  validateDataSync,
};
