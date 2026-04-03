import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const INVITATION_PERMISSIONS = {
  CREATE: 'invitations.create',
  READ: 'invitations.read',
  UPDATE: 'invitations.update',
  DELETE: 'invitations.delete',
} as const;

export const invitationsAbilityDefinitions: PermissionDefinition[] = [
  { permission: INVITATION_PERMISSIONS.CREATE, define: (can) => can(Action.Create, 'Invitation') },
  { permission: INVITATION_PERMISSIONS.READ, define: (can) => can(Action.Read, 'Invitation') },
  { permission: INVITATION_PERMISSIONS.UPDATE, define: (can) => can(Action.Update, 'Invitation') },
  { permission: INVITATION_PERMISSIONS.DELETE, define: (can) => can(Action.Delete, 'Invitation') },
];
