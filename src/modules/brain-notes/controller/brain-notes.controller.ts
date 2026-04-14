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
import { BrainNotesService } from '@/modules/brain-notes/service/brain-notes.service';
import { CreateBrainNoteDto } from '@/modules/brain-notes/dto/create-brain-note.dto';
import { UpdateBrainNoteDto } from '@/modules/brain-notes/dto/update-brain-note.dto';
import { QueryBrainNotesDto } from '@/modules/brain-notes/dto/query-brain-notes.dto';
import { BrainNoteResponseDto } from '@/modules/brain-notes/dto/brain-note-response.dto';
import { PaginatedBrainNotesResponseDto } from '@/modules/brain-notes/dto/paginated-brain-notes-response.dto';

@ApiTags('Brain notes')
@ApiBearerAuth('access-token')
@Controller('brain-notes')
export class BrainNotesController {
  constructor(private readonly brainNotesService: BrainNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a Second Brain note' })
  @ApiCreatedResponse({ type: BrainNoteResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'BrainNote'))
  create(
    @Body() dto: CreateBrainNoteDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainNoteResponseDto> {
    return this.brainNotesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List notes (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedBrainNotesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainNote'))
  findAll(
    @Query() query: QueryBrainNotesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedBrainNotesResponseDto> {
    return this.brainNotesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: BrainNoteResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainNote'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainNoteResponseDto> {
    return this.brainNotesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: BrainNoteResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'BrainNote'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBrainNoteDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainNoteResponseDto> {
    return this.brainNotesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete note' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'BrainNote'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.brainNotesService.delete(id, ability);
  }
}
