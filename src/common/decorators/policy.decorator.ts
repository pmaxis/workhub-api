import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '@/common/ability/ability.types';

export interface PolicyHandler {
  handle(ability: AppAbility, subject?: any): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility, subject?: any) => boolean;
export type Policy = PolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policies';
export const CheckPolicies = (...handlers: Policy[]) => SetMetadata(CHECK_POLICIES_KEY, handlers);
