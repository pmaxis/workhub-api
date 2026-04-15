import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const REMINDER_PERMISSIONS = {
  CREATE: 'reminders.create',
  READ: 'reminders.read',
  UPDATE: 'reminders.update',
  DELETE: 'reminders.delete',
} as const;

export const remindersAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: REMINDER_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Reminder'),
  },
  {
    permission: REMINDER_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Reminder', { userId: user.userId });
    },
  },
  {
    permission: REMINDER_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Reminder', { userId: user.userId });
      can(Action.Update, 'Reminder', { userId: user.userId });
    },
  },
  {
    permission: REMINDER_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Reminder', { userId: user.userId });
      can(Action.Delete, 'Reminder', { userId: user.userId });
    },
  },
];
