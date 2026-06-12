import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Database seed script.
 *
 * Creates initial data required for system operation:
 * 1. Roles (admin, staff_gudang, owner)
 * 2. Default admin user
 * 3. Sample categories
 *
 * Run with: npm run db:seed
 */

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  // ========================================================================
  // 1. CREATE ROLES
  // ========================================================================

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator dengan akses penuh ke seluruh sistem',
      },
    }),
    prisma.role.upsert({
      where: { name: 'staff_gudang' },
      update: {},
      create: {
        name: 'staff_gudang',
        description: 'Staff gudang yang mengelola stok, produk, dan supplier',
      },
    }),
    prisma.role.upsert({
      where: { name: 'owner' },
      update: {},
      create: {
        name: 'owner',
        description: 'Pemilik yang melihat dashboard, laporan, dan analitik',
      },
    }),
  ]);

  console.log(`✅ Roles created: ${roles.map((r) => r.name).join(', ')}`);

  // ========================================================================
  // 2. CREATE DEFAULT USERS
  // ========================================================================

  const adminRole = roles.find((r) => r.name === 'admin');

  if (!adminRole) {
    throw new Error('Failed to find created admin role');
  }

  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@inventaris.com' },
      update: {},
      create: {
        email: 'admin@inventaris.com',
        username: 'superadmin',
        passwordHash: hashedPassword,
        name: 'Super Admin',
        roleId: adminRole.id,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ Users created: ${users.map((u) => u.email).join(', ')}`);

  // ========================================================================
  // 3. CREATE SAMPLE CATEGORIES
  // ========================================================================

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Elektronik' },
      update: {},
      create: {
        name: 'Elektronik',
        description: 'Perangkat elektronik dan aksesoris',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Makanan & Minuman' },
      update: {},
      create: {
        name: 'Makanan & Minuman',
        description: 'Produk makanan dan minuman',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pakaian' },
      update: {},
      create: {
        name: 'Pakaian',
        description: 'Pakaian dan aksesoris fashion',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Peralatan Rumah Tangga' },
      update: {},
      create: {
        name: 'Peralatan Rumah Tangga',
        description: 'Peralatan dan perlengkapan rumah tangga',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Kesehatan & Kecantikan' },
      update: {},
      create: {
        name: 'Kesehatan & Kecantikan',
        description: 'Produk kesehatan dan kecantikan',
      },
    }),
  ]);

  console.log(`✅ Categories created: ${categories.map((c) => c.name).join(', ')}`);

  // ========================================================================
  // 4. CREATE SUPPLIERS
  // ========================================================================

  const suppliersData = [
    {
      name: 'PT. Elektronik Mandiri',
      email: 'sales@elektronikmandiri.co.id',
      phone: '021-5551234',
      address: 'Jl. Tekno Raya No. 12, Serpong, Tangerang',
      contactPerson: 'Budi Santoso',
      isActive: true,
    },
    {
      name: 'CV. Pangan Sejahtera',
      email: 'info@pangansejahtera.com',
      phone: '031-7778899',
      address: 'Kawasan Industri Rungkut Blok D-5, Surabaya',
      contactPerson: 'Siti Aminah',
      isActive: true,
    },
    {
      name: 'Garment Jaya Utama',
      email: 'order@garmentjayautama.com',
      phone: '022-4445556',
      address: 'Jl. Merdeka No. 45, Bandung',
      contactPerson: 'Hendra Wijaya',
      isActive: true,
    },
    {
      name: 'CV. Perabot Nusantara',
      email: 'support@perabotnusantara.co.id',
      phone: '0274-888999',
      address: 'Jl. Kaliurang KM 10, Sleman, Yogyakarta',
      contactPerson: 'Dewi Lestari',
      isActive: true,
    },
  ];

  const suppliers = await Promise.all(
    suppliersData.map((s) =>
      prisma.supplier.upsert({
        where: { id: s.name }, // Hack to make upsert simple or using findFirst + create
        create: s,
        update: s,
      }).catch(async () => {
        // Because of uuid, let's find if exists by name first
        const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
        if (existing) {
          return prisma.supplier.update({ where: { id: existing.id }, data: s });
        }
        return prisma.supplier.create({ data: s });
      })
    )
  );

  console.log(`✅ Suppliers created: ${suppliers.map((s) => s.name).join(', ')}`);

  // ========================================================================
  // 5. CREATE PRODUCTS & INVENTORY
  // ========================================================================

  const catElektronik = categories.find((c) => c.name === 'Elektronik')!;
  const catMakanan = categories.find((c) => c.name === 'Makanan & Minuman')!;
  const catPakaian = categories.find((c) => c.name === 'Pakaian')!;
  const catPerabot = categories.find((c) => c.name === 'Peralatan Rumah Tangga')!;

  const supElektronik = suppliers.find((s) => s.name === 'PT. Elektronik Mandiri')!;
  const supMakanan = suppliers.find((s) => s.name === 'CV. Pangan Sejahtera')!;
  const supPakaian = suppliers.find((s) => s.name === 'Garment Jaya Utama')!;
  const supPerabot = suppliers.find((s) => s.name === 'CV. Perabot Nusantara')!;

  const productsData = [
    {
      sku: 'EL-001',
      name: 'Laptop Asus ROG Strix',
      description: 'Laptop Gaming Intel Core i9, RTX 4080, 32GB RAM, 1TB SSD',
      price: 17500000,
      costPrice: 15000000,
      categoryId: catElektronik.id,
      supplierId: supElektronik.id,
      unit: 'unit',
      rackLocation: 'A-1',
      isActive: true,
      stock: {
        currentStock: 15,
        minStock: 5,
        maxStock: 30,
        safetyStock: 5,
        reorderPoint: 10,
        leadTimeDays: 7,
      },
    },
    {
      sku: 'EL-002',
      name: 'Smartphone Samsung Galaxy S24 Ultra',
      description: 'Flagship Smartphone, 12GB RAM, 512GB Storage, 200MP Camera',
      price: 14000000,
      costPrice: 12000000,
      categoryId: catElektronik.id,
      supplierId: supElektronik.id,
      unit: 'unit',
      rackLocation: 'A-2',
      isActive: true,
      stock: {
        currentStock: 3,
        minStock: 5,
        maxStock: 25,
        safetyStock: 4,
        reorderPoint: 8,
        leadTimeDays: 5,
      },
    },
    {
      sku: 'FN-001',
      name: 'Kopi Kapal Api Special 165g',
      description: 'Kopi bubuk instan kualitas terbaik',
      price: 12500,
      costPrice: 10000,
      categoryId: catMakanan.id,
      supplierId: supMakanan.id,
      unit: 'pcs',
      rackLocation: 'B-1',
      isActive: true,
      stock: {
        currentStock: 120,
        minStock: 20,
        maxStock: 200,
        safetyStock: 20,
        reorderPoint: 40,
        leadTimeDays: 3,
      },
    },
    {
      sku: 'FN-002',
      name: 'Mie Instan Indomie Goreng Spk',
      description: '1 Karton Indomie Goreng isi 40 bungkus',
      price: 3100, // wait this is per pcs or karton? Let's say cost is 100000 per karton and price is 120000
      price_actual: 120000,
      costPrice_actual: 100000,
      unit: 'karton',
      rackLocation: 'B-2',
      isActive: true,
      stock: {
        currentStock: 0,
        minStock: 10,
        maxStock: 100,
        safetyStock: 15,
        reorderPoint: 25,
        leadTimeDays: 4,
      },
    },
    {
      sku: 'CL-001',
      name: 'Kaos Polos Cotton Combed 30s Black',
      description: 'Kaos katun premium tebal, adem, cocok untuk sablon',
      price: 50000,
      costPrice: 35000,
      categoryId: catPakaian.id,
      supplierId: supPakaian.id,
      unit: 'pcs',
      rackLocation: 'C-1',
      isActive: true,
      stock: {
        currentStock: 45,
        minStock: 15,
        maxStock: 150,
        safetyStock: 15,
        reorderPoint: 30,
        leadTimeDays: 10,
      },
    },
    {
      sku: 'HW-001',
      name: 'Wajan Teflon Anti Lengket Maxim 24cm',
      description: 'Wajan masak anti lengket berkualitas tinggi',
      price: 95000,
      costPrice: 75000,
      categoryId: catPerabot.id,
      supplierId: supPerabot.id,
      unit: 'pcs',
      rackLocation: 'D-1',
      isActive: true,
      stock: {
        currentStock: 25,
        minStock: 8,
        maxStock: 60,
        safetyStock: 8,
        reorderPoint: 15,
        leadTimeDays: 6,
      },
    },
  ];

  for (const p of productsData) {
    const price = p.sku === 'FN-002' ? p.price_actual : p.price;
    const costPrice = p.sku === 'FN-002' ? p.costPrice_actual : p.costPrice;

    // Upsert Product
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        price,
        costPrice,
        categoryId: p.categoryId || catMakanan.id, // Fallback
        supplierId: p.supplierId,
        unit: p.unit,
        rackLocation: p.rackLocation,
        isActive: p.isActive,
      },
      update: {
        name: p.name,
        description: p.description,
        price,
        costPrice,
        categoryId: p.categoryId || catMakanan.id,
        supplierId: p.supplierId,
        unit: p.unit,
        rackLocation: p.rackLocation,
        isActive: p.isActive,
      },
    });

    // Upsert corresponding Inventory
    await prisma.inventory.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        currentStock: p.stock.currentStock,
        minStock: p.stock.minStock,
        maxStock: p.stock.maxStock,
        safetyStock: p.stock.safetyStock,
        reorderPoint: p.stock.reorderPoint,
        leadTimeDays: p.stock.leadTimeDays,
      },
      update: {
        currentStock: p.stock.currentStock,
        minStock: p.stock.minStock,
        maxStock: p.stock.maxStock,
        safetyStock: p.stock.safetyStock,
        reorderPoint: p.stock.reorderPoint,
        leadTimeDays: p.stock.leadTimeDays,
      },
    });
  }

  console.log(`✅ Products & Inventories created/updated!`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Default Login Credentials:');
  console.log('   Super Admin  → admin@inventaris.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

