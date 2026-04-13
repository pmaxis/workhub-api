import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { expensesAbilityDefinitions } from '@/modules/expenses/ability/expenses.ability';
import { ExpensesController } from '@/modules/expenses/controller/expenses.controller';
import { ExpensesService } from '@/modules/expenses/service/expenses.service';
import { ExpensesRepository } from '@/modules/expenses/repository/expenses.repository';

@Module({
  imports: [DatabaseModule, ProjectsModule, AbilityModule.forModule(expensesAbilityDefinitions)],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}
