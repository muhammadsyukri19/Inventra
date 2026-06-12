import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { UnauthorizedError } from '../utils/errors';
import type { JwtPayload } from '../types/common.types';

/**
 * Authentication middleware.
 *
 * Verifies the JWT access token from the Authorization header 
 * OR from the query parameter (for SSE support).
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined;

    // 1. Coba ambil dari Authorization Header (Cara standar)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Coba ambil dari Query Parameter (Fallback untuk EventSource/SSE Notifikasi)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    // Jika keduanya kosong, baru lempar error
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }
    next(error);
  }
}