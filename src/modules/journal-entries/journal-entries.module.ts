import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { journalEntriesAbilityDefinitions } from '@/modules/journal-entries/ability/journal-entries.ability';
import { JournalEntriesController } from '@/modules/journal-entries/controller/journal-entries.controller';
import { JournalEntriesService } from '@/modules/journal-entries/service/journal-entries.service';
import { JournalEntriesRepository } from '@/modules/journal-entries/repository/journal-entries.repository';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(journalEntriesAbilityDefinitions)],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService, JournalEntriesRepository],
})
export class JournalEntriesModule {}
