import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateKnowledgeArticleDto } from '@/modules/knowledge-articles/dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleDto } from '@/modules/knowledge-articles/dto/update-knowledge-article.dto';
import { KnowledgeArticleResponseDto } from '@/modules/knowledge-articles/dto/knowledge-article-response.dto';
import { PaginatedKnowledgeArticlesResponseDto } from '@/modules/knowledge-articles/dto/paginated-knowledge-articles-response.dto';
import { KnowledgeArticlesRepository } from '@/modules/knowledge-articles/repository/knowledge-articles.repository';

@Injectable()
export class KnowledgeArticlesService {
  constructor(
    private readonly repository: KnowledgeArticlesRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleResponseDto> {
    let taskId: string | null = null;
    if (dto.taskId) {
      const task = await this.tasksRepository.findOne(dto.taskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      taskId = task.id;
    }

    const row = await this.repository.create({
      userId,
      taskId,
      title: dto.title.trim(),
      body: dto.body ?? '',
      tags: dto.tags?.trim() ? dto.tags.trim() : null,
    });
    return new KnowledgeArticleResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: { taskId?: string; q?: string; page?: number; limit?: number },
  ): Promise<PaginatedKnowledgeArticlesResponseDto> {
    const result = await this.repository.findAll({
      ability,
      taskId: query.taskId,
      q: query.q,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new KnowledgeArticleResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<KnowledgeArticleResponseDto> {
    const row = await this.repository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Article not found');
    }
    return new KnowledgeArticleResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleResponseDto> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Article not found');
    }
    if (!ability.can(Action.Update, subject('KnowledgeArticle', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new KnowledgeArticleResponseDto(existing);
    }

    if (dto.taskId !== undefined && dto.taskId !== null) {
      const task = await this.tasksRepository.findOne(dto.taskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const patch: Parameters<KnowledgeArticlesRepository['update']>[1] = {};
    if (dto.title !== undefined) patch.title = dto.title.trim();
    if (dto.body !== undefined) patch.body = dto.body ?? '';
    if (dto.tags !== undefined) {
      patch.tags = dto.tags === null || dto.tags.trim() === '' ? null : dto.tags.trim();
    }
    if (dto.taskId !== undefined) patch.taskId = dto.taskId;

    const updated = await this.repository.update(id, patch);
    return new KnowledgeArticleResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Article not found');
    }
    if (!ability.can(Action.Delete, subject('KnowledgeArticle', existing))) {
      throw new ForbiddenException();
    }
    await this.repository.delete(id);
  }
}
