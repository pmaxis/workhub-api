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
    create: { key: 'manage.all', description: 'Full access to the admin panel' },
    update: { description: 'Full access to the admin panel' },
  });

  const workspaceMembersRead = await prisma.permission.upsert({
    where: { key: 'workspace.members.read' },
    create: {
      key: 'workspace.members.read',
      description: 'View related workspace contacts (clients and colleagues via relationships)',
    },
    update: {
      description: 'View related workspace contacts (clients and colleagues via relationships)',
    },
  });

  const invitationsCreate = await prisma.permission.upsert({
    where: { key: 'invitations.create' },
    create: { key: 'invitations.create', description: 'Send invitations' },
    update: { description: 'Send invitations' },
  });

  const invitationsRead = await prisma.permission.upsert({
    where: { key: 'invitations.read' },
    create: { key: 'invitations.read', description: 'View invitations within your scope' },
    update: { description: 'View invitations within your scope' },
  });

  const invitationsUpdate = await prisma.permission.upsert({
    where: { key: 'invitations.update' },
    create: { key: 'invitations.update', description: 'Update invitations within your scope' },
    update: { description: 'Update invitations within your scope' },
  });

  const invitationsDelete = await prisma.permission.upsert({
    where: { key: 'invitations.delete' },
    create: { key: 'invitations.delete', description: 'Delete invitations within your scope' },
    update: { description: 'Delete invitations within your scope' },
  });

  const companiesCreate = await prisma.permission.upsert({
    where: { key: 'companies.create' },
    create: { key: 'companies.create', description: 'Create a company (client)' },
    update: { description: 'Create a company (client)' },
  });

  const companiesRead = await prisma.permission.upsert({
    where: { key: 'companies.read' },
    create: { key: 'companies.read', description: 'View your companies' },
    update: { description: 'View your companies' },
  });

  const companiesUpdate = await prisma.permission.upsert({
    where: { key: 'companies.update' },
    create: { key: 'companies.update', description: 'Update your companies' },
    update: { description: 'Update your companies' },
  });

  const companiesDelete = await prisma.permission.upsert({
    where: { key: 'companies.delete' },
    create: { key: 'companies.delete', description: 'Delete your companies' },
    update: { description: 'Delete your companies' },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    create: { slug: 'admin', name: 'Administrator' },
    update: { name: 'Administrator' },
  });

  const clientRole = await prisma.role.upsert({
    where: { slug: 'client' },
    create: { slug: 'client', name: 'Client' },
    update: { name: 'Client' },
  });

  const freelancerRole = await prisma.role.upsert({
    where: { slug: 'freelancer' },
    create: { slug: 'freelancer', name: 'Freelancer' },
    update: { name: 'Freelancer' },
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
      firstName: 'John',
      lastName: 'Client',
      thirdName: 'M.',
      isActivated: true,
    },
    update: {
      firstName: 'John',
      lastName: 'Client',
      thirdName: 'M.',
      isActivated: true,
    },
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
    'Seed completed: admin@test.com / password, client@test.com / password (client has no company yet—creates their own)',
  );
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
