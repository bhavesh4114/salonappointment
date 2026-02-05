import prisma from './client.js';
import { hashPassword } from '../utils/bcrypt.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_MOBILE = '+10000000001'; // unique placeholder for admin

async function main() {
  // Hash password with bcrypt (salt rounds = 10) – never store plain text
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: ADMIN_EMAIL }, { mobileNumber: ADMIN_MOBILE }],
    },
  });

  if (existing) {
    // Ensure existing admin has bcrypt-hashed password and role/isActive (fixes plain-text passwords)
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('Admin user updated (bcrypt hash, role=admin, isActive=true):', existing.email);
    return;
  }

  await prisma.user.create({
    data: {
      fullName: 'Admin',
      email: ADMIN_EMAIL,
      mobileNumber: ADMIN_MOBILE,
      countryCode: '+1',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('Admin user created (bcrypt hash, role=admin, isActive=true):', ADMIN_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
