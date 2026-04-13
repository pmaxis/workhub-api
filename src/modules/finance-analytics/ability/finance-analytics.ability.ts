import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const FINANCE_ANALYTICS_PERMISSIONS = {
  READ: 'finance.analytics.read',
} as const;

export const financeAnalyticsAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: FINANCE_ANALYTICS_PERMISSIONS.READ,
    define: (can) => can(Action.Read, 'FinanceAnalytics'),
  },
];
