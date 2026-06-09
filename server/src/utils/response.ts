import { Response } from 'express';

/**
 * Standardized API response helpers.
 *
 * Ensures consistent response structure across all endpoints:
 * - success: { success: true, data, meta? }
 * - error: { success: false, message, errors? }
 */

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): void {
  const response: SuccessResponse<T> = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>
): void {
  const response: ErrorResponse = { success: false, message };
  if (errors) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
