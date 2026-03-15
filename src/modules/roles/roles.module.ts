import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { RolesService } from '@/modules/roles/service/roles.service';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { RolesController } from '@/modules/roles/controller/roles.controller';
import { RolePermissionsController } from '@/modules/roles/controller/role-permissions.controller';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';
import { rolesAbilityDefinitions } from '@/modules/roles/ability/roles.ability';
import { rolePermissionsAbilityDefinitions } from '@/modules/roles/ability/role-permissions.ability';

@Module({
  imports: [
    DatabaseModule,
    PermissionsModule,
    AbilityModule.forModule([...rolesAbilityDefinitions, ...rolePermissionsAbilityDefinitions]),
  ],
  controllers: [RolesController, RolePermissionsController],
  providers: [RolesService, RolePermissionsService, RolesRepository, RolePermissionsRepository],
  exports: [RolesService, RolePermissionsService, RolesRepository],
})
export class RolesModule {}
