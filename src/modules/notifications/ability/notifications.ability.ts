import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const NOTIFICATION_PERMISSIONS = {
  READ: 'notifications.read',
  CREATE: 'notifications.create',
  UPDATE: 'notifications.update',
} as const;

export const notificationsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: NOTIFICATION_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'Notification', { userId: user.userId });
    },
  },
  {
    permission: NOTIFICATION_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'Notification', { userId: user.userId });
      can(Action.Update, 'Notification', { userId: user.userId });
    },
  },
  {
    permission: NOTIFICATION_PERMISSIONS.CREATE,
    define: (can) => {
      can(Action.Create, 'Notification');
    },
  },
];
