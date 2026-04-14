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
import { JournalEntriesService } from '@/modules/journal-entries/service/journal-entries.service';
import { CreateJournalEntryDto } from '@/modules/journal-entries/dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from '@/modules/journal-entries/dto/update-journal-entry.dto';
import { QueryJournalEntriesDto } from '@/modules/journal-entries/dto/query-journal-entries.dto';
import { JournalEntryResponseDto } from '@/modules/journal-entries/dto/journal-entry-response.dto';
import { PaginatedJournalEntriesResponseDto } from '@/modules/journal-entries/dto/paginated-journal-entries-response.dto';

@ApiTags('Journal entries')
@ApiBearerAuth('access-token')
@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create journal entry' })
  @ApiCreatedResponse({ type: JournalEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'BrainJournalEntry'))
  create(
    @Body() dto: CreateJournalEntryDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<JournalEntryResponseDto> {
    return this.journalEntriesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List journal entries (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedJournalEntriesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainJournalEntry'))
  findAll(
    @Query() query: QueryJournalEntriesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedJournalEntriesResponseDto> {
    return this.journalEntriesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: JournalEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainJournalEntry'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<JournalEntryResponseDto> {
    return this.journalEntriesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update journal entry' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: JournalEntryResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'BrainJournalEntry'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJournalEntryDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<JournalEntryResponseDto> {
    return this.journalEntriesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete journal entry' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'BrainJournalEntry'))
  remove(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.journalEntriesService.delete(id, ability);
  }
}
