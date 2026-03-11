import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const SESSIONS_PERMISSIONS = {
  READ: 'sessions.read',
  DELETE: 'sessions.delete',
} as const;

export const sessionsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: SESSIONS_PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'Session'),
  },
  {
    permission: SESSIONS_PERMISSIONS.DELETE,
    define: (can) => can(Action.Delete, 'Session'),
  },
];
