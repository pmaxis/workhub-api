import { DynamicModule, Module } from '@nestjs/common';
import { AbilityFactory } from '@/common/ability/ability.factory';
import { AbilityRegistry } from '@/common/ability/ability.registry';
import { PermissionDefinition } from '@/common/ability/ability.types';
import { globalPermissionDefinitions } from '@/common/ability/ability.global';

export const PERMISSION_DEFINITIONS = 'PERMISSION_DEFINITIONS';

@Module({})
export class AbilityModule {
  static forRoot(): DynamicModule {
    return {
      module: AbilityModule,
      global: true,
      providers: [
        AbilityRegistry,
        AbilityFactory,
        {
          provide: 'ABILITY_GLOBAL_INIT',
          useFactory: (registry: AbilityRegistry) => {
            for (const def of globalPermissionDefinitions) {
              registry.register(def);
            }
          },
          inject: [AbilityRegistry],
        },
      ],
      exports: [AbilityRegistry, AbilityFactory],
    };
  }

  static forModule(definitions: PermissionDefinition[]): DynamicModule {
    return {
      module: AbilityModule,
      providers: [
        {
          provide: PERMISSION_DEFINITIONS,
          useValue: definitions,
        },
        {
          provide: 'ABILITY_FEATURE_INIT',
          useFactory: (registry: AbilityRegistry) => {
            for (const def of definitions) {
              registry.register(def);
            }
          },
          inject: [AbilityRegistry],
        },
      ],
    };
  }
}
