import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const WORKSPACE_PERMISSIONS = {
  MEMBERS_READ: 'workspace.members.read',
} as const;

export const workspaceAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: WORKSPACE_PERMISSIONS.MEMBERS_READ,
    define: (can) => can(Action.Read, 'WorkspaceMember'),
  },
];
