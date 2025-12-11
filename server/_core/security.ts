/**
 * Security Configuration Module
 * Centraliza todas as configurações de segurança do servidor
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
import { ENV } from './env';
import { logger } from './logger';

/**
 * Configurar Helmet para proteção contra vulnerabilidades comuns
 */
export function setupHelmet(app: Express): void {
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    })
  );
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
  logger.info('Helmet security middleware configured');
}

/**
 * Configurar CORS com validação de origem
 */
export function setupCors(app: Express): void {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  if (ENV.isProduction) {
    // Em produção, adicionar apenas domínios autorizados
    allowedOrigins.push(process.env.FRONTEND_URL || '');
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn('CORS request blocked', { origin });
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24 horas
    })
  );
  logger.info('CORS configured', { allowedOrigins });
}

/**
 * Configurar Rate Limiting
 */
export function setupRateLimiting(app: Express): void {
  // Rate limiter geral
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por janela
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip health check endpoint
      return req.path === '/health';
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  // Rate limiter para autenticação
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 tentativas de login
    skipSuccessfulRequests: true,
    message: 'Muitas tentativas de login, tente novamente mais tarde.',
    handler: (req, res) => {
      logger.warn('Auth rate limit exceeded', { ip: req.ip });
      res.status(429).json({
        error: 'Too many login attempts',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  // Rate limiter para API crítica
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 requisições por minuto
    message: 'Muitas requisições para este endpoint.',
  });

  app.use(generalLimiter);
  app.use('/auth', authLimiter);
  app.use('/api/trpc', apiLimiter);

  logger.info('Rate limiting configured');
}

/**
 * Configurar headers de segurança adicionais
 */
export function setupSecurityHeaders(app: Express): void {
  app.use((req, res, next) => {
    // Remover header X-Powered-By
    res.removeHeader('X-Powered-By');

    // Adicionar headers de segurança customizados
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  });
  logger.info('Custom security headers configured');
}

/**
 * Validar requisição para detectar padrões suspeitos
 */
export function validateRequest(app: Express): void {
  app.use((req, res, next) => {
    // Validar tamanho do payload
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    if (contentLength > 10 * 1024 * 1024) {
      // 10MB
      logger.warn('Oversized payload detected', { ip: req.ip, size: contentLength });
      return res.status(413).json({ error: 'Payload too large' });
    }

    // Validar User-Agent
    const userAgent = req.get('user-agent') || '';
    if (userAgent.length > 500) {
      logger.warn('Suspicious User-Agent detected', { ip: req.ip });
      return res.status(400).json({ error: 'Invalid User-Agent' });
    }

    next();
  });
  logger.info('Request validation configured');
}

/**
 * Sanitizar entrada para prevenir injection attacks
 */
export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return value;

  return value
    .replace(/[<>\"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return escapeMap[char] || char;
    })
    .trim();
}

/**
 * Validar comando shell para whitelist
 */
export const ALLOWED_SHELL_COMMANDS = {
  check_audio: 'arecord -d 2 /tmp/test.wav && aplay /tmp/test.wav',
  check_usb: 'lsusb | grep -i audio',
  check_pulseaudio: 'pactl list sinks',
  check_alsa: 'aplay -l',
  check_audio_devices: 'arecord -l',
  check_system_audio: 'systemctl status pulseaudio',
} as const;

export function isCommandAllowed(command: string): boolean {
  return Object.values(ALLOWED_SHELL_COMMANDS).includes(command);
}

/**
 * Inicializar todas as configurações de segurança
 */
export function initializeSecurity(app: Express): void {
  logger.info('Initializing security configuration');
  setupHelmet(app);
  setupCors(app);
  setupRateLimiting(app);
  setupSecurityHeaders(app);
  validateRequest(app);
  logger.info('Security configuration initialized successfully');
}
