import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const EXPENSE_PERMISSIONS = {
  CREATE: 'expenses.create',
  READ: 'expenses.read',
  UPDATE: 'expenses.update',
  DELETE: 'expenses.delete',
} as const;

export const expensesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: EXPENSE_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Expense'),
  },
  {
    permission: EXPENSE_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Expense', { userId: user.userId });
    },
  },
  {
    permission: EXPENSE_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Expense', { userId: user.userId });
      can(Action.Update, 'Expense', { userId: user.userId });
    },
  },
  {
    permission: EXPENSE_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Expense', { userId: user.userId });
      can(Action.Delete, 'Expense', { userId: user.userId });
    },
  },
];
