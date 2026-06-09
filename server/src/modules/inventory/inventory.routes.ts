import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { updateInventorySettingsSchema, adjustStockSchema, getInventorySchema } from './inventory.schema';

const router = Router();

// Protect all inventory routes
router.use(authMiddleware);

// Public (Authenticated) Read access
router.get('/', inventoryController.getAll);
router.get('/:productId', validate(getInventorySchema), inventoryController.getByProductId);

// Admin & Staff Only access for mutations
router.patch(
  '/:productId/settings',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(updateInventorySettingsSchema),
  inventoryController.updateSettings
);

router.post(
  '/:productId/adjust',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(adjustStockSchema),
  inventoryController.adjustStock
);

export default router;
