import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAbility } from '@/common/ability/ability.types';

export const CurrentAbility = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AppAbility => {
    return ctx.switchToHttp().getRequest<{ ability: AppAbility }>().ability;
  },
);
