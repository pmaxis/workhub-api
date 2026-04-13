import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const PAYMENT_PERMISSIONS = {
  CREATE: 'payments.create',
  READ: 'payments.read',
  UPDATE: 'payments.update',
  DELETE: 'payments.delete',
} as const;

export const paymentsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: PAYMENT_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Payment'),
  },
  {
    permission: PAYMENT_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Payment', { userId: user.userId });
    },
  },
  {
    permission: PAYMENT_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Payment', { userId: user.userId });
      can(Action.Update, 'Payment', { userId: user.userId });
    },
  },
  {
    permission: PAYMENT_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Payment', { userId: user.userId });
      can(Action.Delete, 'Payment', { userId: user.userId });
    },
  },
];
