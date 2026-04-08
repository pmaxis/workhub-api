import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { timeEntriesAbilityDefinitions } from '@/modules/time-entries/ability/time-entries.ability';
import { TimeEntriesController } from '@/modules/time-entries/controller/time-entries.controller';
import { TimeEntriesService } from '@/modules/time-entries/service/time-entries.service';
import { TimeEntriesRepository } from '@/modules/time-entries/repository/time-entries.repository';

@Module({
  imports: [
    DatabaseModule,
    ProjectsModule,
    TasksModule,
    AbilityModule.forModule(timeEntriesAbilityDefinitions),
  ],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService, TimeEntriesRepository],
})
export class TimeEntriesModule {}
