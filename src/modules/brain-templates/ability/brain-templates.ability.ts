import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const BRAIN_TEMPLATE_PERMISSIONS = {
  CREATE: 'brain_templates.create',
  READ: 'brain_templates.read',
  UPDATE: 'brain_templates.update',
  DELETE: 'brain_templates.delete',
} as const;

export const brainTemplatesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: BRAIN_TEMPLATE_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'BrainTemplate'),
  },
  {
    permission: BRAIN_TEMPLATE_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'BrainTemplate', { userId: user.userId });
    },
  },
  {
    permission: BRAIN_TEMPLATE_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'BrainTemplate', { userId: user.userId });
      can(Action.Update, 'BrainTemplate', { userId: user.userId });
    },
  },
  {
    permission: BRAIN_TEMPLATE_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'BrainTemplate', { userId: user.userId });
      can(Action.Delete, 'BrainTemplate', { userId: user.userId });
    },
  },
];
