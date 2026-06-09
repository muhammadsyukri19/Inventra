import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string({ required_error: 'SKU wajib diisi' })
      .min(3, 'SKU minimal 3 karakter')
      .max(50, 'SKU maksimal 50 karakter'),
    name: z.string({ required_error: 'Nama produk wajib diisi' })
      .min(3, 'Nama produk minimal 3 karakter')
      .max(150, 'Nama produk maksimal 150 karakter'),
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
    price: z.number({ required_error: 'Harga jual wajib diisi' })
      .min(0, 'Harga tidak boleh negatif'),
    costPrice: z.number({ required_error: 'Harga modal wajib diisi' })
      .min(0, 'Harga modal tidak boleh negatif'),
    categoryId: z.string({ required_error: 'Kategori wajib diisi' }).uuid('Format ID Kategori tidak valid'),
    supplierId: z.string().uuid('Format ID Supplier tidak valid').optional().nullable(),
    unit: z.string().default('pcs'),
    imageUrl: z.string().url('Format URL gambar tidak valid').optional().nullable(),
    isActive: z.boolean().optional(),
    // Initial inventory settings
    minStock: z.number().min(0).default(0),
    maxStock: z.number().min(0).default(0),
    leadTimeDays: z.number().min(0).default(7),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
  body: z.object({
    sku: z.string().min(3).max(50).optional(),
    name: z.string().min(3).max(150).optional(),
    description: z.string().max(500).optional(),
    price: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional().nullable(),
    unit: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
});
