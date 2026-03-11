import { Injectable } from '@nestjs/common';
import { PermissionDefinition } from '@/common/ability/ability.types';

@Injectable()
export class AbilityRegistry {
  private readonly definitions = new Map<string, PermissionDefinition['define']>();

  register(definition: PermissionDefinition): void {
    if (this.definitions.has(definition.permission)) {
      throw new Error(`Permission "${definition.permission}" is already registered`);
    }
    this.definitions.set(definition.permission, definition.define);
  }

  getDefiner(permission: string): PermissionDefinition['define'] | undefined {
    return this.definitions.get(permission);
  }
}
