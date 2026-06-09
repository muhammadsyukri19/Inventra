import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { JWT_CONFIG } from '../../config/jwt';
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../utils/errors';
import type { JwtPayload } from '../../types/common.types';
import type { LoginResponse, RefreshResponse, UserProfile } from './auth.types';

/**
 * Auth service.
 *
 * Handles authentication business logic:
 * - Login with email/password
 * - Token generation (access + refresh)
 * - Token refresh with rotation
 * - Logout (invalidate refresh token)
 * - Profile retrieval
 */

const SALT_ROUNDS = 12;

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_EXPIRY as any,
  });
}

function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRY as any,
  });
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new UnauthorizedError('Email atau password salah');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Akun Anda telah dinonaktifkan');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const tokenPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store hashed refresh token and update last login
  const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: hashedRefreshToken,
      lastLoginAt: new Date(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(
  refreshToken: string
): Promise<RefreshResponse> {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      refreshToken,
      JWT_CONFIG.REFRESH_SECRET
    ) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Refresh token tidak valid atau sudah expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { role: true },
  });

  if (!user || !user.refreshToken) {
    throw new UnauthorizedError('Refresh token tidak valid');
  }

  // Verify stored refresh token matches
  const isRefreshValid = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!isRefreshValid) {
    // Possible token reuse attack — invalidate all tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new UnauthorizedError('Refresh token telah digunakan. Silakan login ulang');
  }

  const tokenPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
  };

  // Token rotation: generate new pair
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: {
      id: user.role.id,
      name: user.role.name,
    },
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

/**
 * Utility: hash a password for user creation/update.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
