import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { TasksController } from '@/modules/tasks/controller/tasks.controller';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';

@Module({
  imports: [DatabaseModule, ProjectsModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
