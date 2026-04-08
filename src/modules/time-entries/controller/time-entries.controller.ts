import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { TimeEntriesService } from '@/modules/time-entries/service/time-entries.service';
import { CreateTimeEntryDto } from '@/modules/time-entries/dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '@/modules/time-entries/dto/update-time-entry.dto';
import { QueryTimeEntriesDto } from '@/modules/time-entries/dto/query-time-entries.dto';
import { TimeEntryResponseDto } from '@/modules/time-entries/dto/time-entry-response.dto';

@ApiTags('Time entries')
@ApiBearerAuth('access-token')
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create time entry (omit endedAt for a running timer)' })
  @ApiCreatedResponse({ type: TimeEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'TimeEntry'))
  create(
    @Body() dto: CreateTimeEntryDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TimeEntryResponseDto> {
    return this.timeEntriesService.create(userId, ability, dto);
  }

  @Get('running')
  @ApiOperation({ summary: 'Current running time entry, if any' })
  @ApiOkResponse({ type: TimeEntryResponseDto, description: 'Null when no timer is running' })
  @CheckPolicies((ability) => ability.can(Action.Read, 'TimeEntry'))
  findRunning(@CurrentAbility() ability: AppAbility): Promise<TimeEntryResponseDto | null> {
    return this.timeEntriesService.findRunning(ability);
  }

  @Get()
  @ApiOperation({ summary: 'List time entries for the current user' })
  @ApiOkResponse({ type: [TimeEntryResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'TimeEntry'))
  findAll(
    @Query() query: QueryTimeEntriesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TimeEntryResponseDto[]> {
    return this.timeEntriesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time entry by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: TimeEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'TimeEntry'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TimeEntryResponseDto> {
    return this.timeEntriesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update time entry (e.g. stop timer with endedAt)' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: TimeEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'TimeEntry'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TimeEntryResponseDto> {
    return this.timeEntriesService.update(id, userId, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete time entry' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'TimeEntry'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.timeEntriesService.delete(id, ability);
  }
}
