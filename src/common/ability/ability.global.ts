import { PermissionDefinition, Action } from '@/common/ability/ability.types';

export const MANAGE_ALL_PERMISSION = 'manage.all';

export const globalPermissionDefinitions: PermissionDefinition[] = [
  {
    permission: MANAGE_ALL_PERMISSION,
    define: (can) => can(Action.Manage, 'all'),
  },
];
