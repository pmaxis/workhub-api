import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { SessionsController } from '@/modules/sessions/controller/sessions.controller';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { SessionsRepository } from '@/modules/sessions/repository/sessions.repository';
import { sessionsAbilityDefinitions } from '@/modules/sessions/ability/sessions.ability';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule([...sessionsAbilityDefinitions])],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
