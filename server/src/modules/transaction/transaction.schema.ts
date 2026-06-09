import { z } from 'zod';

const transactionItemSchema = z.object({
  productId: z.string({ required_error: 'ID Produk wajib diisi' }).uuid('Format ID Produk tidak valid'),
  quantity: z.number({ required_error: 'Kuantitas wajib diisi' }).int('Kuantitas harus bilangan bulat').positive('Kuantitas harus lebih besar dari 0'),
  unitPrice: z.number({ required_error: 'Harga satuan wajib diisi' }).min(0, 'Harga satuan tidak boleh negatif'),
});

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['IN', 'OUT'], { required_error: 'Tipe transaksi wajib diisi (IN/OUT)' }),
    notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
    items: z.array(transactionItemSchema).min(1, 'Minimal satu produk harus dipilih'),
  }),
});

export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Format ID tidak valid'),
  }),
});
