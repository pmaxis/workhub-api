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
import { RemindersService } from '@/modules/reminders/service/reminders.service';
import { CreateReminderDto } from '@/modules/reminders/dto/create-reminder.dto';
import { UpdateReminderDto } from '@/modules/reminders/dto/update-reminder.dto';
import { QueryRemindersDto } from '@/modules/reminders/dto/query-reminders.dto';
import { ReminderResponseDto } from '@/modules/reminders/dto/reminder-response.dto';
import { PaginatedRemindersResponseDto } from '@/modules/reminders/dto/paginated-reminders-response.dto';

@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create reminder' })
  @ApiCreatedResponse({ type: ReminderResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Reminder'))
  create(
    @Body() dto: CreateReminderDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List reminders (paginated)' })
  @ApiOkResponse({ type: PaginatedRemindersResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Reminder'))
  findAll(
    @Query() query: QueryRemindersDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedRemindersResponseDto> {
    return this.remindersService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ReminderResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Reminder'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ReminderResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Reminder'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Reminder'))
  remove(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.remindersService.delete(id, ability);
  }
}
