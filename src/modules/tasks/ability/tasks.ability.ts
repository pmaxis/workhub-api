import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const TASK_PERMISSIONS = {
  CREATE: 'tasks.create',
  READ: 'tasks.read',
  READ_ALL: 'tasks.read.all',
  UPDATE: 'tasks.update',
  DELETE: 'tasks.delete',
} as const;

export const tasksAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: TASK_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'Task'),
  },
  {
    permission: TASK_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Task', { projectOwnerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Task', { projectCompanyId: companyId });
      }
    },
  },
  {
    permission: TASK_PERMISSIONS.READ_ALL,
    define: (can) => can(Action.Read, 'Task'),
  },
  {
    permission: TASK_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Task', { projectOwnerId: user.userId });
      can(Action.Update, 'Task', { projectOwnerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Task', { projectCompanyId: companyId });
        can(Action.Update, 'Task', { projectCompanyId: companyId });
      }
    },
  },
  {
    permission: TASK_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'Task', { projectOwnerId: user.userId });
      can(Action.Delete, 'Task', { projectOwnerId: user.userId });

      for (const companyId of user.companyIds) {
        can(Action.Read, 'Task', { projectCompanyId: companyId });
        can(Action.Delete, 'Task', { projectCompanyId: companyId });
      }
    },
  },
];
