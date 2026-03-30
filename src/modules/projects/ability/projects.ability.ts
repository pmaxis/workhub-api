import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: PROJECT_PERMISSIONS, definitions: projectsAbilityDefinitions } =
  createCrudAbilityDefinitions('projects', 'Project');

export { PROJECT_PERMISSIONS, projectsAbilityDefinitions };
