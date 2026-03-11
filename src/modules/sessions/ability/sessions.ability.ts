import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const SESSIONS_PERMISSIONS = {
  CREATE: 'users.create',
  READ: 'users.read',
  UPDATE: 'users.update',
  DELETE: 'users.delete',
} as const;

export const sessionsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: SESSIONS_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Session'),
  },
  {
    permission: SESSIONS_PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'Session'),
  },
  {
    permission: SESSIONS_PERMISSIONS.UPDATE,
    define: (can) => can(Action.Update, 'Session'),
  },
  {
    permission: SESSIONS_PERMISSIONS.DELETE,
    define: (can) => can(Action.Delete, 'Session'),
  },
];
