import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: USER_PERMISSIONS, definitions: usersAbilityDefinitions } =
  createCrudAbilityDefinitions('users', 'User');

export { USER_PERMISSIONS, usersAbilityDefinitions };
