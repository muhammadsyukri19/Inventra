import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // Menggunakan library enkripsi asli

const prisma = new PrismaClient();

async function main() {
  const passwordAsli = 'password123';
  // Mengenkripsi password secara otomatis
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(passwordAsli, salt);

  // 1. Hapus user lama (supaya tidak duplikat)
  await prisma.user.deleteMany({ where: { username: 'admin' } });

  // 2. Pastikan Role Admin ada
  const role = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator' },
  });

  // 3. Buat User baru dengan password yang sudah dienkripsi
  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      username: 'admin',
      name: 'Admin Inventra',
      passwordHash: hash, // Menggunakan hasil enkripsi asli
      status: 'ACTIVE',
      roleId: role.id,
    },
  });

  console.log('✅ USER ADMIN BERHASIL DIPERBAIKI!');
  console.log('Username: admin');
  console.log('Password: password123');
}

main()
  .catch((e) => console.error('Gagal membuat user:', e))
  .finally(() => prisma.$disconnect());