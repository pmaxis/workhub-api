import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/infrastructure/database/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const SALT_ROUNDS = 12;

async function seed() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const permission = await prisma.permission.upsert({
    where: { key: 'manage.all' },
    create: { key: 'manage.all', description: 'Повний доступ до адмін-панелі' },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    create: { slug: 'admin', name: 'Адміністратор' },
    update: {},
  });

  await prisma.role.upsert({
    where: { slug: 'client' },
    create: { slug: 'client', name: 'Клієнт' },
    update: {},
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    },
    create: {
      roleId: adminRole.id,
      permissionId: permission.id,
    },
    update: {},
  });

  const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Admin',
    },
    update: {},
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
    update: {},
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  console.log('Seed completed: admin@test.com / password');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
