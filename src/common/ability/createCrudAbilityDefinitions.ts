import { Action } from '@/common/ability/ability.types';
import type { PermissionDefinition } from '@/common/ability/ability.types';

export function createCrudAbilityDefinitions(
  resource: string,
  subject: string,
): { permissions: Record<string, string>; definitions: PermissionDefinition[] } {
  const permissions = {
    CREATE: `${resource}.create`,
    READ: `${resource}.read`,
    UPDATE: `${resource}.update`,
    DELETE: `${resource}.delete`,
  } as const;

  const definitions: PermissionDefinition[] = [
    { permission: permissions.CREATE, define: (can) => can(Action.Create, subject) },
    { permission: permissions.READ, define: (can) => can(Action.Read, subject) },
    { permission: permissions.UPDATE, define: (can) => can(Action.Update, subject) },
    { permission: permissions.DELETE, define: (can) => can(Action.Delete, subject) },
  ];

  return { permissions, definitions };
}
