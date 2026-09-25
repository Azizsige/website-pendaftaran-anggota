import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Data Akun Admin (Super Admin)
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@system.local' },
    update: {},
    create: {
      email: 'admin@system.local',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Created/Verified Super Admin:', superAdmin.email);

  // 2. Data Setting
  const settingRegActive = await prisma.systemSetting.upsert({
    where: { key: 'REG_IS_ACTIVE' },
    update: {},
    create: {
      key: 'REG_IS_ACTIVE',
      value: 'true',
      category: 'GENERAL',
      description: 'Menentukan apakah pendaftaran anggota sedang dibuka atau ditutup.',
    },
  });

  console.log('Created/Verified System Setting REG_IS_ACTIVE:', settingRegActive.value);

  // 3. Data Dummy Member Profile (Untuk testing UI & Chart)
  const dummyPassword = await bcrypt.hash('member123', 10);
  
  const statuses = ['PENDING', 'REJECTED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
  const firstNames = ['Budi', 'Siti', 'Andi', 'Dewi', 'Rudi', 'Sri', 'Agus', 'Tari', 'Eko', 'Rina', 'Cahyo', 'Ayu', 'Joko', 'Dian', 'Wahyu', 'Nia'];
  const lastNames = ['Santoso', 'Rahayu', 'Setiawan', 'Lestari', 'Wibowo', 'Mulyani', 'Saputra', 'Handayani', 'Pratama', 'Sari', 'Kurniawan', 'Putri'];

  console.log('Generating 30 dummy members...');

  for (let i = 1; i <= 30; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `dummy${i}@example.local`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date within the last 6 months
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 180));
    
    const dummyUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        password: dummyPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: d,
      },
    });

    await prisma.memberProfile.upsert({
      where: { userId: dummyUser.id },
      update: {},
      create: {
        userId: dummyUser.id,
        nim: `2314020${i.toString().padStart(2, '0')}`,
        phoneNumber: `081${Math.floor(Math.random() * 100000000)}`,
        placeOfBirth: 'Jakarta',
        dateOfBirth: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1),
        gender: Math.random() > 0.5 ? 'Laki-Laki' : 'Perempuan',
        address: `Jl. Dummy No. ${i}, Kampus`,
        faculty: 'FASILKOM-TI',
        major: 'Teknologi Informasi',
        batchYear: '2023',
        status: status,
        createdAt: d,
      },
    });
  }

  console.log('Created 30 Dummy Members for chart and table visualization.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
