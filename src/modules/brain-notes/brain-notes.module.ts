import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { brainNotesAbilityDefinitions } from '@/modules/brain-notes/ability/brain-notes.ability';
import { BrainNotesController } from '@/modules/brain-notes/controller/brain-notes.controller';
import { BrainNotesService } from '@/modules/brain-notes/service/brain-notes.service';
import { BrainNotesRepository } from '@/modules/brain-notes/repository/brain-notes.repository';

@Module({
  imports: [DatabaseModule, TasksModule, AbilityModule.forModule(brainNotesAbilityDefinitions)],
  controllers: [BrainNotesController],
  providers: [BrainNotesService, BrainNotesRepository],
})
export class BrainNotesModule {}
