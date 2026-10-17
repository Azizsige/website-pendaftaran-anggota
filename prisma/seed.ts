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
    { key: 'kta_org_name', value: 'BEM Fakultas Ilmu Komputer' },
    { key: 'kta_member_prefix', value: 'BEM-24-' },
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

  console.log('Seeding finished (No dummy members, clean slate ready for demo!).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
