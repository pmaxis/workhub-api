import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: TASK_PERMISSIONS, definitions: tasksAbilityDefinitions } =
  createCrudAbilityDefinitions('tasks', 'Task');

export { TASK_PERMISSIONS, tasksAbilityDefinitions };
