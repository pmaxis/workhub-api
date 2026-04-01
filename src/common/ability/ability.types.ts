import { PureAbility } from '@casl/ability';
import { PrismaQuery } from '@casl/prisma';

export type RequestUser = {
  userId: string;
  sessionId: string;
  permissions: string[];
  companyIds: string[];
};

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = PureAbility<[Action, any], PrismaQuery>;

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
