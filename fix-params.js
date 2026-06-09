const fs = require('fs');

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
  content = content.replace(/req\.params\.id/g, "(req.params.id as string)");
  content = content.replace(/req\.query\.type as 'IN' \| 'OUT' \| undefined/g, "(req.query.type as 'IN' | 'OUT' | undefined)");
  content = content.replace(/req\.query\.startDate as string/g, "(req.query.startDate as string)");
  content = content.replace(/req\.query\.endDate as string/g, "(req.query.endDate as string)");
  fs.writeFileSync(p, content);
  console.log('Fixed req.params.id in', p);
}
