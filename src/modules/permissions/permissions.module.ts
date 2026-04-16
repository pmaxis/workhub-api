import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { AdminAuditLogsModule } from '@/modules/admin-audit-logs/admin-audit-logs.module';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { PermissionsController } from '@/modules/permissions/controller/permissions.controller';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { permissionsAbilityDefinitions } from '@/modules/permissions/ability/permissions.ability';

@Module({
  imports: [
    DatabaseModule,
    AdminAuditLogsModule,
    AbilityModule.forModule(permissionsAbilityDefinitions),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService],
})
export class PermissionsModule {}
