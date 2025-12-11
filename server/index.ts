import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './_core/env';
import { logger } from './_core/logger';
import { initializeSecurity } from './_core/security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  try {
    // Inicializar segurança
    initializeSecurity(app);

    // Body parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Request logging
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path}`, {
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
        });
      });
      next();
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Serve static files
    const staticPath =
      ENV.nodeEnv === 'production'
        ? path.resolve(__dirname, 'public')
        : path.resolve(__dirname, '..', 'dist', 'public');

    app.use(express.static(staticPath));

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.status(err.status || 500).json({
        error: ENV.isProduction ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    app.get('*', (_req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Iniciando graceful shutdown...');
      server.close(() => {
        logger.info('Servidor encerrado');
        process.exit(0);
      });

      // Force shutdown após 30 segundos
      setTimeout(() => {
        logger.error('Forçando encerramento após 30 segundos');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    server.listen(ENV.port, () => {
      logger.info(`✅ Servidor iniciado em http://localhost:${ENV.port}/`);
      logger.info(`Ambiente: ${ENV.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error as Error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
