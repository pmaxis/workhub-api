import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { ProjectsController } from '@/modules/projects/controller/projects.controller';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { projectsAbilityDefinitions } from '@/modules/projects/ability/projects.ability';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(projectsAbilityDefinitions)],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
