import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z.string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid'),
  username: z.string({ required_error: 'Username wajib diisi' })
    .min(3, 'Username minimal 3 karakter'),
  password: z.string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
  roleId: z.string({ required_error: 'Role wajib diisi' })
    .uuid('Format Role ID tidak valid'),
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Minimal satu field harus diisi untuk update',
});

export const getUserSchema = z.object({
  id: z.string().uuid('Format ID tidak valid'),
});
