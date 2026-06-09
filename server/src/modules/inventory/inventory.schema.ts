import { z } from 'zod';

export const updateInventorySettingsSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Format ID tidak valid'),
  }),
  body: z.object({
    minStock: z.number().min(0).optional(),
    maxStock: z.number().min(0).optional(),
    leadTimeDays: z.number().min(0).optional(),
    reorderPoint: z.number().min(0).optional(),
    safetyStock: z.number().min(0).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  }),
});

export const adjustStockSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Format ID tidak valid'),
  }),
  body: z.object({
    quantity: z.number().int('Kuantitas harus bilangan bulat'),
    movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    reason: z.string().max(255, 'Alasan maksimal 255 karakter').optional(),
  }).refine(data => {
    if (data.movementType === 'ADJUSTMENT' && !data.reason) {
      return false;
    }
    return true;
  }, {
    message: 'Alasan wajib diisi untuk penyesuaian (ADJUSTMENT)',
    path: ['reason']
  }),
});

export const getInventorySchema = z.object({
  params: z.object({
    productId: z.string().uuid('Format ID tidak valid'),
  }),
});
