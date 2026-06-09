import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createSupplierSchema, updateSupplierSchema, getSupplierSchema } from './supplier.schema';
import { z } from 'zod';

const router = Router();

const toggleActiveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ isActive: z.boolean() }),
});

// Protect all supplier routes
router.use(authMiddleware);

// Public (Authenticated) Read access
router.get('/', supplierController.getAll);
router.get('/:id', validate(getSupplierSchema), supplierController.getById);

// Admin & Staff Only access for mutations
router.post(
  '/',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(createSupplierSchema),
  supplierController.create
);

router.put(
  '/:id',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(updateSupplierSchema),
  supplierController.update
);

router.patch(
  '/:id/status',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(toggleActiveSchema),
  supplierController.toggleActive
);

export default router;
