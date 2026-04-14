import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { brainTemplatesAbilityDefinitions } from '@/modules/brain-templates/ability/brain-templates.ability';
import { BrainTemplatesController } from '@/modules/brain-templates/controller/brain-templates.controller';
import { BrainTemplatesService } from '@/modules/brain-templates/service/brain-templates.service';
import { BrainTemplatesRepository } from '@/modules/brain-templates/repository/brain-templates.repository';

@Module({
  imports: [DatabaseModule, TasksModule, AbilityModule.forModule(brainTemplatesAbilityDefinitions)],
  controllers: [BrainTemplatesController],
  providers: [BrainTemplatesService, BrainTemplatesRepository],
})
export class BrainTemplatesModule {}
