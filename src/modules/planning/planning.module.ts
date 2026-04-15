import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { RemindersModule } from '@/modules/reminders/reminders.module';
import { PlanningController } from '@/modules/planning/controller/planning.controller';
import { PlanningService } from '@/modules/planning/service/planning.service';

@Module({
  imports: [DatabaseModule, TasksModule, RemindersModule],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
