import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const JOURNAL_ENTRY_PERMISSIONS = {
  CREATE: 'brain_journal_entries.create',
  READ: 'brain_journal_entries.read',
  UPDATE: 'brain_journal_entries.update',
  DELETE: 'brain_journal_entries.delete',
} as const;

export const journalEntriesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: JOURNAL_ENTRY_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'BrainJournalEntry'),
  },
  {
    permission: JOURNAL_ENTRY_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'BrainJournalEntry', { userId: user.userId });
    },
  },
  {
    permission: JOURNAL_ENTRY_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'BrainJournalEntry', { userId: user.userId });
      can(Action.Update, 'BrainJournalEntry', { userId: user.userId });
    },
  },
  {
    permission: JOURNAL_ENTRY_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'BrainJournalEntry', { userId: user.userId });
      can(Action.Delete, 'BrainJournalEntry', { userId: user.userId });
    },
  },
];
