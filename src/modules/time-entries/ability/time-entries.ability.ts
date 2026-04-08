import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const TIME_ENTRY_PERMISSIONS = {
  CREATE: 'time_entries.create',
  READ: 'time_entries.read',
  UPDATE: 'time_entries.update',
  DELETE: 'time_entries.delete',
} as const;

export const timeEntriesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: TIME_ENTRY_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'TimeEntry'),
  },
  {
    permission: TIME_ENTRY_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'TimeEntry', { userId: user.userId });
    },
  },
  {
    permission: TIME_ENTRY_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'TimeEntry', { userId: user.userId });
      can(Action.Update, 'TimeEntry', { userId: user.userId });
    },
  },
  {
    permission: TIME_ENTRY_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'TimeEntry', { userId: user.userId });
      can(Action.Delete, 'TimeEntry', { userId: user.userId });
    },
  },
];
