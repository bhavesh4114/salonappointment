import prisma from './client.js';
import { hashPassword } from '../utils/bcrypt.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_MOBILE = '+10000000001'; // unique placeholder for admin

async function main() {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: ADMIN_EMAIL }, { mobileNumber: ADMIN_MOBILE }],
    },
  });

  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists:', existing.email);
      return;
    }
    console.log('Updating existing user to admin role:', existing.email);
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin' },
    });
    console.log('Admin role set.');
    return;
  }

  const hashedPassword = await hashPassword(ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      fullName: 'Admin',
      email: ADMIN_EMAIL,
      mobileNumber: ADMIN_MOBILE,
      countryCode: '+1',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Admin user created:', ADMIN_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
