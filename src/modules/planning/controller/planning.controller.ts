import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { PlanningService } from '@/modules/planning/service/planning.service';
import { QueryPlanningCalendarDto } from '@/modules/planning/dto/query-planning-calendar.dto';
import { QueryPlanningDeadlinesDto } from '@/modules/planning/dto/query-planning-deadlines.dto';
import { PlanningCalendarResponseDto } from '@/modules/planning/dto/planning-calendar-response.dto';
import { PlanningDeadlinesResponseDto } from '@/modules/planning/dto/planning-deadlines-response.dto';

@ApiTags('Planning')
@ApiBearerAuth('access-token')
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get('calendar')
  @ApiOperation({ summary: 'Tasks and active reminders in a calendar date range' })
  @ApiOkResponse({ type: PlanningCalendarResponseDto })
  @CheckPolicies(
    (ability) => ability.can(Action.Read, 'Task') || ability.can(Action.Read, 'Reminder'),
  )
  getCalendar(
    @Query() query: QueryPlanningCalendarDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PlanningCalendarResponseDto> {
    return this.planningService.getCalendar(ability, query);
  }

  @Get('deadlines')
  @ApiOperation({ summary: 'Open tasks with a due date within the horizon (includes overdue)' })
  @ApiOkResponse({ type: PlanningDeadlinesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  getDeadlines(
    @Query() query: QueryPlanningDeadlinesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PlanningDeadlinesResponseDto> {
    return this.planningService.getDeadlines(ability, query);
  }
}
