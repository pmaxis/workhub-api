import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { financeAnalyticsAbilityDefinitions } from '@/modules/finance-analytics/ability/finance-analytics.ability';
import { FinanceAnalyticsController } from '@/modules/finance-analytics/controller/finance-analytics.controller';
import { FinanceAnalyticsService } from '@/modules/finance-analytics/service/finance-analytics.service';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(financeAnalyticsAbilityDefinitions)],
  controllers: [FinanceAnalyticsController],
  providers: [FinanceAnalyticsService],
})
export class FinanceAnalyticsModule {}
