import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import type { LoginInput, RefreshTokenInput, RegisterInput } from './auth.schema';

/**
 * Auth controller.
 *
 * Handles HTTP layer for authentication endpoints.
 * Delegates business logic to auth service.
 */

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as RegisterInput;
    const result = await authService.register(data);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { identifier, password } = req.body as LoginInput;
    const result = await authService.login(identifier, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshTokenInput;
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    await authService.logout(req.user.id);
    sendSuccess(res, { message: 'Logout berhasil' });
  } catch (error) {
    next(error);
  }
}

export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    const profile = await authService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}
