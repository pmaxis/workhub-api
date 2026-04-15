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

  const notificationsRead = await prisma.permission.upsert({
    where: { key: 'notifications.read' },
    create: { key: 'notifications.read', description: 'View your notifications' },
    update: { description: 'View your notifications' },
  });

  const notificationsUpdate = await prisma.permission.upsert({
    where: { key: 'notifications.update' },
    create: { key: 'notifications.update', description: 'Mark your notifications as read' },
    update: { description: 'Mark your notifications as read' },
  });

  const timeEntriesCreate = await prisma.permission.upsert({
    where: { key: 'time_entries.create' },
    create: { key: 'time_entries.create', description: 'Create your time entries' },
    update: { description: 'Create your time entries' },
  });

  const timeEntriesRead = await prisma.permission.upsert({
    where: { key: 'time_entries.read' },
    create: { key: 'time_entries.read', description: 'View your time entries' },
    update: { description: 'View your time entries' },
  });

  const timeEntriesUpdate = await prisma.permission.upsert({
    where: { key: 'time_entries.update' },
    create: { key: 'time_entries.update', description: 'Update your time entries' },
    update: { description: 'Update your time entries' },
  });

  const timeEntriesDelete = await prisma.permission.upsert({
    where: { key: 'time_entries.delete' },
    create: { key: 'time_entries.delete', description: 'Delete your time entries' },
    update: { description: 'Delete your time entries' },
  });

  const invoicesCreate = await prisma.permission.upsert({
    where: { key: 'invoices.create' },
    create: { key: 'invoices.create', description: 'Create your invoices' },
    update: { description: 'Create your invoices' },
  });
  const invoicesRead = await prisma.permission.upsert({
    where: { key: 'invoices.read' },
    create: { key: 'invoices.read', description: 'View your invoices' },
    update: { description: 'View your invoices' },
  });
  const invoicesUpdate = await prisma.permission.upsert({
    where: { key: 'invoices.update' },
    create: { key: 'invoices.update', description: 'Update your invoices' },
    update: { description: 'Update your invoices' },
  });
  const invoicesDelete = await prisma.permission.upsert({
    where: { key: 'invoices.delete' },
    create: { key: 'invoices.delete', description: 'Delete your invoices' },
    update: { description: 'Delete your invoices' },
  });

  const paymentsCreate = await prisma.permission.upsert({
    where: { key: 'payments.create' },
    create: { key: 'payments.create', description: 'Record payments' },
    update: { description: 'Record payments' },
  });
  const paymentsRead = await prisma.permission.upsert({
    where: { key: 'payments.read' },
    create: { key: 'payments.read', description: 'View your payments' },
    update: { description: 'View your payments' },
  });
  const paymentsUpdate = await prisma.permission.upsert({
    where: { key: 'payments.update' },
    create: { key: 'payments.update', description: 'Update your payments' },
    update: { description: 'Update your payments' },
  });
  const paymentsDelete = await prisma.permission.upsert({
    where: { key: 'payments.delete' },
    create: { key: 'payments.delete', description: 'Delete your payments' },
    update: { description: 'Delete your payments' },
  });

  const expensesCreate = await prisma.permission.upsert({
    where: { key: 'expenses.create' },
    create: { key: 'expenses.create', description: 'Create your expenses' },
    update: { description: 'Create your expenses' },
  });
  const expensesRead = await prisma.permission.upsert({
    where: { key: 'expenses.read' },
    create: { key: 'expenses.read', description: 'View your expenses' },
    update: { description: 'View your expenses' },
  });
  const expensesUpdate = await prisma.permission.upsert({
    where: { key: 'expenses.update' },
    create: { key: 'expenses.update', description: 'Update your expenses' },
    update: { description: 'Update your expenses' },
  });
  const expensesDelete = await prisma.permission.upsert({
    where: { key: 'expenses.delete' },
    create: { key: 'expenses.delete', description: 'Delete your expenses' },
    update: { description: 'Delete your expenses' },
  });

  const financeAnalyticsRead = await prisma.permission.upsert({
    where: { key: 'finance.analytics.read' },
    create: { key: 'finance.analytics.read', description: 'View finance analytics summary' },
    update: { description: 'View finance analytics summary' },
  });

  const brainNotesCreate = await prisma.permission.upsert({
    where: { key: 'brain_notes.create' },
    create: { key: 'brain_notes.create', description: 'Create Second Brain notes' },
    update: { description: 'Create Second Brain notes' },
  });
  const brainNotesRead = await prisma.permission.upsert({
    where: { key: 'brain_notes.read' },
    create: { key: 'brain_notes.read', description: 'View your Second Brain notes' },
    update: { description: 'View your Second Brain notes' },
  });
  const brainNotesUpdate = await prisma.permission.upsert({
    where: { key: 'brain_notes.update' },
    create: { key: 'brain_notes.update', description: 'Update your Second Brain notes' },
    update: { description: 'Update your Second Brain notes' },
  });
  const brainNotesDelete = await prisma.permission.upsert({
    where: { key: 'brain_notes.delete' },
    create: { key: 'brain_notes.delete', description: 'Delete your Second Brain notes' },
    update: { description: 'Delete your Second Brain notes' },
  });

  const knowledgeArticlesCreate = await prisma.permission.upsert({
    where: { key: 'knowledge_articles.create' },
    create: { key: 'knowledge_articles.create', description: 'Create knowledge base articles' },
    update: { description: 'Create knowledge base articles' },
  });
  const knowledgeArticlesRead = await prisma.permission.upsert({
    where: { key: 'knowledge_articles.read' },
    create: { key: 'knowledge_articles.read', description: 'View your knowledge base articles' },
    update: { description: 'View your knowledge base articles' },
  });
  const knowledgeArticlesUpdate = await prisma.permission.upsert({
    where: { key: 'knowledge_articles.update' },
    create: {
      key: 'knowledge_articles.update',
      description: 'Update your knowledge base articles',
    },
    update: { description: 'Update your knowledge base articles' },
  });
  const knowledgeArticlesDelete = await prisma.permission.upsert({
    where: { key: 'knowledge_articles.delete' },
    create: {
      key: 'knowledge_articles.delete',
      description: 'Delete your knowledge base articles',
    },
    update: { description: 'Delete your knowledge base articles' },
  });

  const brainTemplatesCreate = await prisma.permission.upsert({
    where: { key: 'brain_templates.create' },
    create: { key: 'brain_templates.create', description: 'Create Second Brain templates' },
    update: { description: 'Create Second Brain templates' },
  });
  const brainTemplatesRead = await prisma.permission.upsert({
    where: { key: 'brain_templates.read' },
    create: { key: 'brain_templates.read', description: 'View your Second Brain templates' },
    update: { description: 'View your Second Brain templates' },
  });
  const brainTemplatesUpdate = await prisma.permission.upsert({
    where: { key: 'brain_templates.update' },
    create: { key: 'brain_templates.update', description: 'Update your Second Brain templates' },
    update: { description: 'Update your Second Brain templates' },
  });
  const brainTemplatesDelete = await prisma.permission.upsert({
    where: { key: 'brain_templates.delete' },
    create: { key: 'brain_templates.delete', description: 'Delete your Second Brain templates' },
    update: { description: 'Delete your Second Brain templates' },
  });

  const journalEntriesCreate = await prisma.permission.upsert({
    where: { key: 'brain_journal_entries.create' },
    create: { key: 'brain_journal_entries.create', description: 'Create journal entries' },
    update: { description: 'Create journal entries' },
  });
  const journalEntriesRead = await prisma.permission.upsert({
    where: { key: 'brain_journal_entries.read' },
    create: { key: 'brain_journal_entries.read', description: 'View your journal entries' },
    update: { description: 'View your journal entries' },
  });
  const journalEntriesUpdate = await prisma.permission.upsert({
    where: { key: 'brain_journal_entries.update' },
    create: { key: 'brain_journal_entries.update', description: 'Update your journal entries' },
    update: { description: 'Update your journal entries' },
  });
  const journalEntriesDelete = await prisma.permission.upsert({
    where: { key: 'brain_journal_entries.delete' },
    create: { key: 'brain_journal_entries.delete', description: 'Delete your journal entries' },
    update: { description: 'Delete your journal entries' },
  });

  const remindersCreate = await prisma.permission.upsert({
    where: { key: 'reminders.create' },
    create: { key: 'reminders.create', description: 'Create reminders' },
    update: { description: 'Create reminders' },
  });
  const remindersRead = await prisma.permission.upsert({
    where: { key: 'reminders.read' },
    create: { key: 'reminders.read', description: 'View your reminders' },
    update: { description: 'View your reminders' },
  });
  const remindersUpdate = await prisma.permission.upsert({
    where: { key: 'reminders.update' },
    create: { key: 'reminders.update', description: 'Update your reminders' },
    update: { description: 'Update your reminders' },
  });
  const remindersDelete = await prisma.permission.upsert({
    where: { key: 'reminders.delete' },
    create: { key: 'reminders.delete', description: 'Delete your reminders' },
    update: { description: 'Delete your reminders' },
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
    notificationsRead,
    notificationsUpdate,
    timeEntriesCreate,
    timeEntriesRead,
    timeEntriesUpdate,
    timeEntriesDelete,
    invoicesCreate,
    invoicesRead,
    invoicesUpdate,
    invoicesDelete,
    paymentsCreate,
    paymentsRead,
    paymentsUpdate,
    paymentsDelete,
    expensesCreate,
    expensesRead,
    expensesUpdate,
    expensesDelete,
    financeAnalyticsRead,
    brainNotesCreate,
    brainNotesRead,
    brainNotesUpdate,
    brainNotesDelete,
    knowledgeArticlesCreate,
    knowledgeArticlesRead,
    knowledgeArticlesUpdate,
    knowledgeArticlesDelete,
    brainTemplatesCreate,
    brainTemplatesRead,
    brainTemplatesUpdate,
    brainTemplatesDelete,
    journalEntriesCreate,
    journalEntriesRead,
    journalEntriesUpdate,
    journalEntriesDelete,
    remindersCreate,
    remindersRead,
    remindersUpdate,
    remindersDelete,
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

  const existingAdminWelcome = await prisma.notification.findFirst({
    where: { userId: user.id, title: 'Welcome to WorkHub' },
  });
  if (!existingAdminWelcome) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to WorkHub',
        body: 'Notifications module is enabled.',
        type: 'SYSTEM',
        data: { source: 'seed' },
      },
    });
  }

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

  const existingClientWelcome = await prisma.notification.findFirst({
    where: { userId: clientUser.id, title: 'Welcome to WorkHub' },
  });
  if (!existingClientWelcome) {
    await prisma.notification.create({
      data: {
        userId: clientUser.id,
        title: 'Welcome to WorkHub',
        body: 'You have a new notification.',
        type: 'SYSTEM',
        data: { source: 'seed' },
      },
    });
  }

  console.log(
    'Seed completed: admin@test.com / password, client@test.com / password (client has no company yet—creates their own)',
  );
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
