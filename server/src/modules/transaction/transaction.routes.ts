import { Router } from 'express';
import { transactionController } from './transaction.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { createTransactionSchema, getTransactionSchema } from './transaction.schema';

const router = Router();

// Protect all transaction routes
router.use(authMiddleware);

// Public (Authenticated) Read access
router.get('/', transactionController.getAll);
router.get('/:id', validate(getTransactionSchema), transactionController.getById);

// Admin & Staff Only access for mutations (Creating transactions)
// NOTE: Transactions are immutable, so there's no PUT/PATCH/DELETE
router.post(
  '/',
  rbacMiddleware('admin', 'staff_gudang'),
  validate(createTransactionSchema),
  transactionController.create
);

export default router;
