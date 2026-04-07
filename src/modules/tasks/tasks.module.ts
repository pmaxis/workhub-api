import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { TasksController } from '@/modules/tasks/controller/tasks.controller';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { tasksAbilityDefinitions } from '@/modules/tasks/ability/tasks.ability';

@Module({
  imports: [
    DatabaseModule,
    ProjectsModule,
    NotificationsModule,
    AbilityModule.forModule(tasksAbilityDefinitions),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
