import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama supplier wajib diisi' })
      .min(3, 'Nama supplier minimal 3 karakter')
      .max(100, 'Nama supplier maksimal 100 karakter'),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    phone: z.string().max(20, 'Nomor telepon maksimal 20 karakter').optional().or(z.literal('')),
    address: z.string().max(255, 'Alamat maksimal 255 karakter').optional().or(z.literal('')),
    contactPerson: z.string().max(100, 'Nama kontak person maksimal 100 karakter').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(255).optional().or(z.literal('')),
    contactPerson: z.string().max(100).optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  }),
});

export const getSupplierSchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
});
