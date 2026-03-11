import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const USER_PERMISSIONS = {
  CREATE: 'users.create',
  READ: 'users.read',
  UPDATE: 'users.update',
  DELETE: 'users.delete',
} as const;

export const usersAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: USER_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'User'),
  },
  {
    permission: USER_PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'User'),
  },
  {
    permission: USER_PERMISSIONS.UPDATE,
    define: (can) => can(Action.Update, 'User'),
  },
  {
    permission: USER_PERMISSIONS.DELETE,
    define: (can) => can(Action.Delete, 'User'),
  },
];
