const fs = require('fs');

// Fix getPaginationMeta
const controllers = [
  'server/src/modules/category/category.controller.ts',
  'server/src/modules/supplier/supplier.controller.ts',
  'server/src/modules/user/user.controller.ts',
  'server/src/modules/product/product.controller.ts',
  'server/src/modules/inventory/inventory.controller.ts',
  'server/src/modules/transaction/transaction.controller.ts'
];

for (const p of controllers) {
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/getPaginationMeta/g, "buildPaginationMeta");
  // Fix req.query typescript errors
  content = content.replace(/req\.query\.search as string/g, "(req.query.search as string)");
  content = content.replace(/req\.query\.role as string/g, "(req.query.role as string)");
  content = content.replace(/req\.query\.status as string/g, "(req.query.status as string)");
  content = content.replace(/req\.query\.categoryId as string/g, "(req.query.categoryId as string)");
  content = content.replace(/req\.query\.supplierId as string/g, "(req.query.supplierId as string)");
  fs.writeFileSync(p, content);
  console.log('Fixed controller', p);
}

// Fix bcrypt
const userSvc = 'server/src/modules/user/user.service.ts';
if (fs.existsSync(userSvc)) {
  let content = fs.readFileSync(userSvc, 'utf8');
  content = content.replace(/from 'bcrypt'/g, "from 'bcryptjs'");
  fs.writeFileSync(userSvc, content);
  console.log('Fixed bcrypt import in user.service.ts');
}

// Fix auth.service.ts jwt overloads
const authSvc = 'server/src/modules/auth/auth.service.ts';
if (fs.existsSync(authSvc)) {
  let content = fs.readFileSync(authSvc, 'utf8');
  content = content.replace(/jwt\.sign\([^,]+,\s*env\.JWT_SECRET/g, "jwt.sign(payload, env.JWT_SECRET as string");
  content = content.replace(/jwt\.sign\(\{ userId \},\s*env\.JWT_REFRESH_SECRET/g, "jwt.sign({ userId }, env.JWT_REFRESH_SECRET as string");
  fs.writeFileSync(authSvc, content);
  console.log('Fixed jwt overload in auth.service.ts');
}

