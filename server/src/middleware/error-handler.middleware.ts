import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware.
 *
 * Catches all errors thrown in the request pipeline.
 * Distinguishes between operational errors (client mistakes)
 * and programming errors (bugs) for appropriate responses.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error:', err);
    }
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unexpected errors
  logger.error('Unhandled error:', err);
  sendError(res, 'Internal Server Error', 500);
}
