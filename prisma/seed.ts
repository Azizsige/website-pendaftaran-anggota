import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Data Akun Admin (Owner & Super Admin)
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@system.local' },
    update: {},
    create: {
      email: 'owner@system.local',
      name: 'System Owner',
      password: adminPassword,
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });
  console.log('Created/Verified Owner:', owner.email);

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

  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@system.local' },
    update: {},
    create: {
      email: 'coordinator@system.local',
      name: 'Koordinator',
      password: adminPassword,
      role: 'COORDINATOR',
      status: 'ACTIVE',
    },
  });
  console.log('Created/Verified Coordinator:', coordinator.email);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@system.local' },
    update: {},
    create: {
      email: 'staff@system.local',
      name: 'Staff',
      password: adminPassword,
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });
  console.log('Created/Verified Staff:', staff.email);

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

  // Default KTA Settings
  const ktaSettings = [
    { key: 'kta_bg_front_url', value: '' },
    { key: 'kta_bg_back_url', value: '' },
    { key: 'kta_org_name', value: 'BEM FT UNSRI' },
    { key: 'kta_member_prefix', value: 'BEM-2026-' },
    { key: 'kta_validity_months', value: '12' },
    { key: 'kta_show_photo', value: 'true' },
    { key: 'kta_show_name', value: 'true' },
    { key: 'kta_show_nim', value: 'true' },
    { key: 'kta_show_member_id', value: 'true' },
    { key: 'kta_show_faculty', value: 'false' },
    { key: 'kta_show_major', value: 'false' },
    { key: 'kta_show_validity', value: 'true' },
    { key: 'kta_show_qr', value: 'true' },
  ];

  for (const setting of ktaSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        category: 'ID_CARD',
        description: `Pengaturan ID Card: ${setting.key}`,
      },
    });
  }
  console.log('Created/Verified Default KTA Settings');

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
