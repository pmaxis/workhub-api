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
import { KnowledgeArticlesService } from '@/modules/knowledge-articles/service/knowledge-articles.service';
import { CreateKnowledgeArticleDto } from '@/modules/knowledge-articles/dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleDto } from '@/modules/knowledge-articles/dto/update-knowledge-article.dto';
import { QueryKnowledgeArticlesDto } from '@/modules/knowledge-articles/dto/query-knowledge-articles.dto';
import { KnowledgeArticleResponseDto } from '@/modules/knowledge-articles/dto/knowledge-article-response.dto';
import { PaginatedKnowledgeArticlesResponseDto } from '@/modules/knowledge-articles/dto/paginated-knowledge-articles-response.dto';

@ApiTags('Knowledge articles')
@ApiBearerAuth('access-token')
@Controller('knowledge-articles')
export class KnowledgeArticlesController {
  constructor(private readonly knowledgeArticlesService: KnowledgeArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create knowledge base article' })
  @ApiCreatedResponse({ type: KnowledgeArticleResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'KnowledgeArticle'))
  create(
    @Body() dto: CreateKnowledgeArticleDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeArticlesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List articles (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedKnowledgeArticlesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'KnowledgeArticle'))
  findAll(
    @Query() query: QueryKnowledgeArticlesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedKnowledgeArticlesResponseDto> {
    return this.knowledgeArticlesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: KnowledgeArticleResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'KnowledgeArticle'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeArticlesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: KnowledgeArticleResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'KnowledgeArticle'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeArticleDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeArticlesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete article' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'KnowledgeArticle'))
  remove(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.knowledgeArticlesService.delete(id, ability);
  }
}
