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
import { BrainTemplatesService } from '@/modules/brain-templates/service/brain-templates.service';
import { CreateBrainTemplateDto } from '@/modules/brain-templates/dto/create-brain-template.dto';
import { UpdateBrainTemplateDto } from '@/modules/brain-templates/dto/update-brain-template.dto';
import { QueryBrainTemplatesDto } from '@/modules/brain-templates/dto/query-brain-templates.dto';
import { BrainTemplateResponseDto } from '@/modules/brain-templates/dto/brain-template-response.dto';
import { PaginatedBrainTemplatesResponseDto } from '@/modules/brain-templates/dto/paginated-brain-templates-response.dto';

@ApiTags('Brain templates')
@ApiBearerAuth('access-token')
@Controller('brain-templates')
export class BrainTemplatesController {
  constructor(private readonly brainTemplatesService: BrainTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create reusable template' })
  @ApiCreatedResponse({ type: BrainTemplateResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'BrainTemplate'))
  create(
    @Body() dto: CreateBrainTemplateDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainTemplateResponseDto> {
    return this.brainTemplatesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List templates (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedBrainTemplatesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainTemplate'))
  findAll(
    @Query() query: QueryBrainTemplatesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedBrainTemplatesResponseDto> {
    return this.brainTemplatesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: BrainTemplateResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'BrainTemplate'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainTemplateResponseDto> {
    return this.brainTemplatesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: BrainTemplateResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'BrainTemplate'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBrainTemplateDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<BrainTemplateResponseDto> {
    return this.brainTemplatesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete template' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'BrainTemplate'))
  remove(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.brainTemplatesService.delete(id, ability);
  }
}
