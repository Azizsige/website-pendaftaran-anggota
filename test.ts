import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function check() {
  console.log("Checking database...");
  const user = await prisma.user.findUnique({
    where: { email: 'admin@system.local' }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User found:", user.email);
  console.log("Password hash:", user.password);

  const isValid = await bcrypt.compare('admin123', user.password!);
  console.log("Password is valid for 'admin123':", isValid);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
