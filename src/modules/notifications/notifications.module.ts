import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { notificationsAbilityDefinitions } from '@/modules/notifications/ability/notifications.ability';
import { NotificationsController } from '@/modules/notifications/controller/notifications.controller';
import { NotificationsService } from '@/modules/notifications/service/notifications.service';
import { NotificationsRepository } from '@/modules/notifications/repository/notifications.repository';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(notificationsAbilityDefinitions)],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
