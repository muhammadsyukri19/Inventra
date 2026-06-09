import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createCategorySchema, updateCategorySchema, getCategorySchema } from './category.schema';

const router = Router();

// Protect all category routes
router.use(authMiddleware);

// Public (Authenticated) Read access
router.get('/', categoryController.getAll);
router.get('/:id', validate(getCategorySchema), categoryController.getById);

// Admin & Staff Only access for mutations
router.post(
  '/',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  '/:id',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(getCategorySchema), // Uses same param schema
  categoryController.delete
);

export default router;
