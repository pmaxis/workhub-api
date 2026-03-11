import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const ROLES_PERMISSIONS = {
  CREATE: 'roles.create',
  READ: 'roles.read',
  UPDATE: 'roles.update',
  DELETE: 'roles.delete',
} as const;

export const rolesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: ROLES_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Role'),
  },
  {
    permission: ROLES_PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'Role'),
  },
  {
    permission: ROLES_PERMISSIONS.UPDATE,
    define: (can) => can(Action.Update, 'Role'),
  },
  {
    permission: ROLES_PERMISSIONS.DELETE,
    define: (can) => can(Action.Delete, 'Role'),
  },
];
