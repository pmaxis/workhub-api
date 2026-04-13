import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Action } from '@/common/ability/ability.types';
import { FinanceAnalyticsService } from '@/modules/finance-analytics/service/finance-analytics.service';
import { QueryFinanceSummaryDto } from '@/modules/finance-analytics/dto/query-finance-summary.dto';
import { FinanceSummaryResponseDto } from '@/modules/finance-analytics/dto/finance-summary-response.dto';

@ApiTags('Finance analytics')
@ApiBearerAuth('access-token')
@Controller('finance/analytics')
export class FinanceAnalyticsController {
  constructor(private readonly financeAnalyticsService: FinanceAnalyticsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Finance summary for the current user',
    description:
      'Invoices grouped by status (filtered by invoice createdAt). Payments and expenses use receivedAt / spentAt for the optional date range.',
  })
  @ApiOkResponse({ type: FinanceSummaryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'FinanceAnalytics'))
  getSummary(
    @Query() query: QueryFinanceSummaryDto,
    @CurrentUserId() userId: string,
  ): Promise<FinanceSummaryResponseDto> {
    return this.financeAnalyticsService.getSummary(userId, query);
  }
}
