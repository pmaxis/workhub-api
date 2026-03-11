import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const PERMISSIONS = {
  CREATE: 'permissions.create',
  READ: 'permissions.read',
  UPDATE: 'permissions.update',
  DELETE: 'permissions.delete',
} as const;

export const permissionsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Permission'),
  },
  {
    permission: PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'Permission'),
  },
  {
    permission: PERMISSIONS.UPDATE,
    define: (can) => can(Action.Update, 'Permission'),
  },
  {
    permission: PERMISSIONS.DELETE,
    define: (can) => can(Action.Delete, 'Permission'),
  },
];
