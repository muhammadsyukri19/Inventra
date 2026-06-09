const fs = require('fs');

const paths = [
  'server/src/modules/category/category.service.ts',
  'server/src/modules/supplier/supplier.service.ts',
  'server/src/modules/user/user.service.ts',
  'server/src/modules/product/product.service.ts',
  'server/src/modules/inventory/inventory.service.ts',
  'server/src/modules/transaction/transaction.service.ts',
  'server/src/modules/user/user.controller.ts' // prisma is used here too
];

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/import prisma from '\.\.\/\.\.\/config\/database';/g, "import { prisma } from '../../config/database';");
  fs.writeFileSync(p, content);
  console.log('Fixed prisma import in', p);
}
