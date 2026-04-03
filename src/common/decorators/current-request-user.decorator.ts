import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '@/common/ability/ability.types';

export const CurrentRequestUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
