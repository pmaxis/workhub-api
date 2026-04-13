import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const INVOICE_PERMISSIONS = {
  CREATE: 'invoices.create',
  READ: 'invoices.read',
  UPDATE: 'invoices.update',
  DELETE: 'invoices.delete',
} as const;

export const invoicesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: INVOICE_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Invoice'),
  },
  {
    permission: INVOICE_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Invoice', { userId: user.userId });
    },
  },
  {
    permission: INVOICE_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Invoice', { userId: user.userId });
      can(Action.Update, 'Invoice', { userId: user.userId });
    },
  },
  {
    permission: INVOICE_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Invoice', { userId: user.userId });
      can(Action.Delete, 'Invoice', { userId: user.userId });
    },
  },
];
