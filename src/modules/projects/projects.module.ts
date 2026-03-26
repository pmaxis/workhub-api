import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { ProjectsController } from '@/modules/projects/controller/projects.controller';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
