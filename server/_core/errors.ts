/**
 * Centralized Error Handling Module
 * Define tipos de erro e utilidades para tratamento
 */

import { TRPCError } from '@trpc/server';
import { logger } from './logger';

/**
 * Tipos de erro customizados
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Não autenticado') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Não autorizado') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} não encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error {
  constructor(message: string = 'Erro interno do servidor') {
    super(message);
    this.name = 'InternalServerError';
  }
}

/**
 * Converter erro para TRPCError
 */
export function toTRPCError(error: Error | unknown): TRPCError {
  if (error instanceof ValidationError) {
    logger.warn('Validation error', { message: error.message, details: error.details });
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: error.details,
    });
  }

  if (error instanceof AuthenticationError) {
    logger.warn('Authentication error', { message: error.message });
    return new TRPCError({
      code: 'UNAUTHORIZED',
      message: error.message,
    });
  }

  if (error instanceof AuthorizationError) {
    logger.warn('Authorization error', { message: error.message });
    return new TRPCError({
      code: 'FORBIDDEN',
      message: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    logger.debug('Not found error', { message: error.message });
    return new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
    });
  }

  if (error instanceof ConflictError) {
    logger.warn('Conflict error', { message: error.message });
    return new TRPCError({
      code: 'CONFLICT',
      message: error.message,
    });
  }

  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof Error) {
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
    });
  }

  logger.error('Unknown error', { error });
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro desconhecido',
  });
}

/**
 * Wrapper para async functions com tratamento de erro
 */
export async function asyncHandler<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (context) {
      logger.error(`Error in ${context}`, error as Error);
    }
    throw toTRPCError(error);
  }
}

/**
 * Validar e lançar erro se falhar
 */
export function validate(condition: boolean, message: string, details?: Record<string, any>): void {
  if (!condition) {
    throw new ValidationError(message, details);
  }
}

/**
 * Lançar erro de autenticação
 */
export function requireAuth(user: any): void {
  if (!user) {
    throw new AuthenticationError();
  }
}

/**
 * Lançar erro de autorização
 */
export function requirePermission(hasPermission: boolean, resource: string = 'recurso'): void {
  if (!hasPermission) {
    throw new AuthorizationError(`Você não tem permissão para acessar ${resource}`);
  }
}

export default {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  toTRPCError,
  asyncHandler,
  validate,
  requireAuth,
  requirePermission,
};
