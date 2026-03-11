import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AbilityCan, AppAbility } from '@/common/ability/ability.types';
import { AbilityRegistry } from '@/common/ability/ability.registry';

export type RequestUser = {
  userId: string;
  sessionId: string;
  permissions?: string[];
};

@Injectable()
export class AbilityFactory {
  constructor(private readonly registry: AbilityRegistry) {}

  createForUser(user: RequestUser | null | undefined): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

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
