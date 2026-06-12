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
