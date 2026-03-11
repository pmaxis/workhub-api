import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const ROLE_PERMISSIONS = {
  MANAGE: 'roles.manage.permissions',
} as const;

export const rolePermissionsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: ROLE_PERMISSIONS.MANAGE,
    define: (can) => can(Action.Manage, 'RolePermission'),
  },
];
