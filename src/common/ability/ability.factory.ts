import { Injectable } from '@nestjs/common';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { AbilityCan, AppAbility, RequestUser } from '@/common/ability/ability.types';
import { AbilityRegistry } from '@/common/ability/ability.registry';

@Injectable()
export class AbilityFactory {
  constructor(private readonly registry: AbilityRegistry) {}

  createForUser(user: RequestUser | null | undefined): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const permissions = user?.permissions ?? [];

    for (const permission of permissions) {
      const definer = this.registry.getDefiner(permission);
      if (definer) {
        definer(can as AbilityCan, user!);
      }
    }

    return build();
  }
}
