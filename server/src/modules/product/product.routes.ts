import { Router } from 'express';
import { productController } from './product.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createProductSchema, updateProductSchema, getProductSchema } from './product.schema';
import { z } from 'zod';

const router = Router();

const toggleActiveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ isActive: z.boolean() }),
});

// Protect all product routes
router.use(authMiddleware);

// Public (Authenticated) Read access
router.get('/', productController.getAll);
router.get('/:id', validate(getProductSchema), productController.getById);
/*
 * Menambahkan route untuk mencari produk berdasarkan SKU (Barcode)
 */
router.get('/validate/:code', productController.validateBySku);
// Detail produk berdasarkan ID (UUID)
router.get('/:id', validate(getProductSchema), productController.getById);

// Admin & Staff Only access for mutations
router.post(
  '/',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(updateProductSchema),
  productController.update
);

router.patch(
  '/:id/status',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(toggleActiveSchema),
  productController.toggleActive
);

export default router;
