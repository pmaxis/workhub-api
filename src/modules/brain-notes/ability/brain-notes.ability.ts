import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const BRAIN_NOTE_PERMISSIONS = {
  CREATE: 'brain_notes.create',
  READ: 'brain_notes.read',
  UPDATE: 'brain_notes.update',
  DELETE: 'brain_notes.delete',
} as const;

export const brainNotesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: BRAIN_NOTE_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'BrainNote'),
  },
  {
    permission: BRAIN_NOTE_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'BrainNote', { userId: user.userId });
    },
  },
  {
    permission: BRAIN_NOTE_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'BrainNote', { userId: user.userId });
      can(Action.Update, 'BrainNote', { userId: user.userId });
    },
  },
  {
    permission: BRAIN_NOTE_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'BrainNote', { userId: user.userId });
      can(Action.Delete, 'BrainNote', { userId: user.userId });
    },
  },
];
