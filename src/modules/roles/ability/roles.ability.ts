import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: ROLES_PERMISSIONS, definitions: rolesAbilityDefinitions } =
  createCrudAbilityDefinitions('roles', 'Role');

export { ROLES_PERMISSIONS, rolesAbilityDefinitions };
