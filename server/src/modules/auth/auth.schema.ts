import { z } from 'zod';

/**
 * Auth module Zod schemas.
 *
 * Defines validation schemas for authentication endpoints.
 */

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Username atau Email wajib diisi' })
    .min(3, 'Username/Email minimal 3 karakter'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string({ required_error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  username: z.string({ required_error: 'Username wajib diisi' }).min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(6, 'Password minimal 6 karakter'),
  roleId: z.string({ required_error: 'Role wajib dipilih' }).uuid('Role ID tidak valid'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token wajib diisi' })
    .min(1, 'Refresh token tidak boleh kosong'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
