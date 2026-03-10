import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { SessionsController } from '@/modules/sessions/controller/sessions.controller';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { SessionsRepository } from '@/modules/sessions/repository/sessions.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
