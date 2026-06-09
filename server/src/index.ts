import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';

/**
 * Server entry point.
 *
 * Initializes database connection and starts the HTTP server.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

async function bootstrap(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📋 Environment: ${env.NODE_ENV}`);
      logger.info(`🏥 Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
