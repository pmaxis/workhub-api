import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const PROJECT_PERMISSIONS = {
  CREATE: 'projects.create',
  READ: 'projects.read',
  READ_ALL: 'projects.read.all',
  UPDATE: 'projects.update',
  DELETE: 'projects.delete',
} as const;

export const projectsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: PROJECT_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Project'),
  },
  {
    permission: PROJECT_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Project', { ownerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Project', { companyId });
      }
    },
  },
  {
    permission: PROJECT_PERMISSIONS.READ_ALL,
    define: (can) => can(Action.Read, 'Project'),
  },
  {
    permission: PROJECT_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Project', { ownerId: user.userId });
      can(Action.Update, 'Project', { ownerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Project', { companyId });
        can(Action.Update, 'Project', { companyId });
      }
    },
  },
  {
    permission: PROJECT_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Project', { ownerId: user.userId });
      can(Action.Delete, 'Project', { ownerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Project', { companyId });
        can(Action.Delete, 'Project', { companyId });
      }
    },
  },
];
