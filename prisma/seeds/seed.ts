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

  const workspaceMembersRead = await prisma.permission.upsert({
    where: { key: 'workspace.members.read' },
    create: {
      key: 'workspace.members.read',
      description: 'Перегляд пов’язаних контактів (клієнти / колеги за зв’язками)',
    },
    update: {},
  });

  const invitationsCreate = await prisma.permission.upsert({
    where: { key: 'invitations.create' },
    create: { key: 'invitations.create', description: 'Надсилання запрошень' },
    update: {},
  });

  const invitationsRead = await prisma.permission.upsert({
    where: { key: 'invitations.read' },
    create: { key: 'invitations.read', description: 'Перегляд запрошень у своїй області' },
    update: {},
  });

  const invitationsUpdate = await prisma.permission.upsert({
    where: { key: 'invitations.update' },
    create: { key: 'invitations.update', description: 'Оновлення запрошень у своїй області' },
    update: {},
  });

  const invitationsDelete = await prisma.permission.upsert({
    where: { key: 'invitations.delete' },
    create: { key: 'invitations.delete', description: 'Видалення запрошень у своїй області' },
    update: {},
  });

  const companiesCreate = await prisma.permission.upsert({
    where: { key: 'companies.create' },
    create: { key: 'companies.create', description: 'Створення компанії (клієнт)' },
    update: {},
  });

  const companiesRead = await prisma.permission.upsert({
    where: { key: 'companies.read' },
    create: { key: 'companies.read', description: 'Перегляд своїх компаній' },
    update: {},
  });

  const companiesUpdate = await prisma.permission.upsert({
    where: { key: 'companies.update' },
    create: { key: 'companies.update', description: 'Оновлення своїх компаній' },
    update: {},
  });

  const companiesDelete = await prisma.permission.upsert({
    where: { key: 'companies.delete' },
    create: { key: 'companies.delete', description: 'Видалення своїх компаній' },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    create: { slug: 'admin', name: 'Адміністратор' },
    update: {},
  });

  const clientRole = await prisma.role.upsert({
    where: { slug: 'client' },
    create: { slug: 'client', name: 'Клієнт' },
    update: {},
  });

  const freelancerRole = await prisma.role.upsert({
    where: { slug: 'freelancer' },
    create: { slug: 'freelancer', name: 'Фрілансер' },
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

  const collaborationPermissions = [
    workspaceMembersRead,
    invitationsCreate,
    invitationsRead,
    invitationsUpdate,
    invitationsDelete,
    companiesRead,
  ];

  for (const role of [clientRole, freelancerRole]) {
    for (const p of collaborationPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: p.id,
          },
        },
        create: {
          roleId: role.id,
          permissionId: p.id,
        },
        update: {},
      });
    }
  }

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: clientRole.id,
        permissionId: companiesCreate.id,
      },
    },
    create: {
      roleId: clientRole.id,
      permissionId: companiesCreate.id,
    },
    update: {},
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: clientRole.id,
        permissionId: companiesUpdate.id,
      },
    },
    create: {
      roleId: clientRole.id,
      permissionId: companiesUpdate.id,
    },
    update: {},
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: clientRole.id,
        permissionId: companiesDelete.id,
      },
    },
    create: {
      roleId: clientRole.id,
      permissionId: companiesDelete.id,
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

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    create: {
      email: 'client@test.com',
      password: hashedPassword,
      firstName: 'Петро',
      lastName: 'Петренко',
      thirdName: 'Петрович',
      isActivated: true,
    },
    update: {},
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: clientUser.id,
        roleId: clientRole.id,
      },
    },
    create: {
      userId: clientUser.id,
      roleId: clientRole.id,
    },
    update: {},
  });

  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    create: { userId: clientUser.id },
    update: {},
  });

  console.log(
    'Seed completed: admin@test.com / password, client@test.com / password (клієнт без компанії — створює сам)',
  );
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
