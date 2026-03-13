import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '@/common/ability/ability.factory';
import { RequestUser } from '@/common/ability/ability.types';
import { CHECK_POLICIES_KEY, Policy } from '@/common/decorators/policy.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const policies = this.reflector.getAllAndOverride<Policy[]>(CHECK_POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!policies?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) throw new UnauthorizedException();

    const ability = this.abilityFactory.createForUser(user);

    const allowed = policies.every((policy) =>
      typeof policy === 'function' ? policy(ability) : policy.handle(ability),
    );

    if (!allowed) throw new ForbiddenException('Policy check failed');

    return true;
  }
}
