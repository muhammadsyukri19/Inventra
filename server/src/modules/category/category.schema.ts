import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama kategori wajib diisi' })
      .min(3, 'Nama kategori minimal 3 karakter')
      .max(50, 'Nama kategori maksimal 50 karakter'),
    description: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(255).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
});
