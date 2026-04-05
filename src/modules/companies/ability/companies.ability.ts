import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const COMPANY_PERMISSIONS = {
  CREATE: 'companies.create',
  READ: 'companies.read',
  UPDATE: 'companies.update',
  DELETE: 'companies.delete',
} as const;

export const companiesAbilityDefinitions: PermissionDefinition[] = [
  { permission: COMPANY_PERMISSIONS.CREATE, define: (can) => can(Action.Create, 'Company') },
  { permission: COMPANY_PERMISSIONS.READ, define: (can) => can(Action.Read, 'Company') },
  {
    permission: COMPANY_PERMISSIONS.UPDATE,
    define: (can, user) => {
      for (const companyId of user.companyIds) {
        can(Action.Read, 'Company', { id: companyId });
        can(Action.Update, 'Company', { id: companyId });
      }
    },
  },
  {
    permission: COMPANY_PERMISSIONS.DELETE,
    define: (can, user) => {
      for (const companyId of user.companyIds) {
        can(Action.Read, 'Company', { id: companyId });
        can(Action.Delete, 'Company', { id: companyId });
      }
    },
  },
];
