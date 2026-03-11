import { MongoAbility } from '@casl/ability';
import { RequestUser } from '@/common/ability/ability.factory';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = MongoAbility<[Action, any]>;

export interface PolicyHandler {
  handle(ability: AppAbility, subject?: any): boolean;
}

export type PolicyHandlerCallback = (ability: AppAbility, subject?: any) => boolean;
export type Policy = PolicyHandler | PolicyHandlerCallback;

export interface PermissionDefinition {
  permission: string;
  define: (can: AbilityCan, user: RequestUser) => void;
}

export type AbilityCan = (action: Action, subject: any, conditions?: Record<string, any>) => void;
