const fs = require('fs');

const paths = [
  'server/src/modules/category/category.routes.ts',
  'server/src/modules/supplier/supplier.routes.ts',
  'server/src/modules/user/user.routes.ts',
  'server/src/modules/product/product.routes.ts',
  'server/src/modules/inventory/inventory.routes.ts',
  'server/src/modules/transaction/transaction.routes.ts'
];

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/from '\.\.\/\.\.\/middleware\/validate';/g, "from '../../middleware/validation.middleware';");
  content = content.replace(/import { authMiddleware, rbacMiddleware } from '\.\.\/\.\.\/middleware\/auth';/g, "import { authMiddleware } from '../../middleware/auth.middleware';\nimport { rbacMiddleware } from '../../middleware/rbac.middleware';");
  content = content.replace(/import { authMiddleware } from '\.\.\/\.\.\/middleware\/auth';/g, "import { authMiddleware } from '../../middleware/auth.middleware';");
  fs.writeFileSync(p, content);
  console.log('Fixed', p);
}
