import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { PermissionsController } from '@/modules/permissions/controller/permissions.controller';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
