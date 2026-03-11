import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const USER_ROLES_PERMISSIONS = {
  MANAGE: 'users.manage.roles',
} as const;

export const userRolesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: USER_ROLES_PERMISSIONS.MANAGE,
    define: (can) => can(Action.Manage, 'UserRole'),
  },
];
