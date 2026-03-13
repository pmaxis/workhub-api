import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: PERMISSIONS, definitions: permissionsAbilityDefinitions } =
  createCrudAbilityDefinitions('permissions', 'Permission');

export { PERMISSIONS, permissionsAbilityDefinitions };
