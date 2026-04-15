import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { remindersAbilityDefinitions } from '@/modules/reminders/ability/reminders.ability';
import { RemindersController } from '@/modules/reminders/controller/reminders.controller';
import { RemindersService } from '@/modules/reminders/service/reminders.service';
import { RemindersRepository } from '@/modules/reminders/repository/reminders.repository';

@Module({
  imports: [DatabaseModule, TasksModule, AbilityModule.forModule(remindersAbilityDefinitions)],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository],
  exports: [RemindersRepository],
})
export class RemindersModule {}
