import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateBrainTemplateDto } from '@/modules/brain-templates/dto/create-brain-template.dto';
import { UpdateBrainTemplateDto } from '@/modules/brain-templates/dto/update-brain-template.dto';
import { BrainTemplateResponseDto } from '@/modules/brain-templates/dto/brain-template-response.dto';
import { PaginatedBrainTemplatesResponseDto } from '@/modules/brain-templates/dto/paginated-brain-templates-response.dto';
import { BrainTemplatesRepository } from '@/modules/brain-templates/repository/brain-templates.repository';

@Injectable()
export class BrainTemplatesService {
  constructor(
    private readonly repository: BrainTemplatesRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateBrainTemplateDto,
  ): Promise<BrainTemplateResponseDto> {
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
    return new BrainTemplateResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: { taskId?: string; q?: string; page?: number; limit?: number },
  ): Promise<PaginatedBrainTemplatesResponseDto> {
    const result = await this.repository.findAll({
      ability,
      taskId: query.taskId,
      q: query.q,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new BrainTemplateResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<BrainTemplateResponseDto> {
    const row = await this.repository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Template not found');
    }
    return new BrainTemplateResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateBrainTemplateDto,
  ): Promise<BrainTemplateResponseDto> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Template not found');
    }
    if (!ability.can(Action.Update, subject('BrainTemplate', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new BrainTemplateResponseDto(existing);
    }

    if (dto.taskId !== undefined && dto.taskId !== null) {
      const task = await this.tasksRepository.findOne(dto.taskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const patch: Parameters<BrainTemplatesRepository['update']>[1] = {};
    if (dto.title !== undefined) patch.title = dto.title.trim();
    if (dto.body !== undefined) patch.body = dto.body ?? '';
    if (dto.tags !== undefined) {
      patch.tags = dto.tags === null || dto.tags.trim() === '' ? null : dto.tags.trim();
    }
    if (dto.taskId !== undefined) patch.taskId = dto.taskId;

    const updated = await this.repository.update(id, patch);
    return new BrainTemplateResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Template not found');
    }
    if (!ability.can(Action.Delete, subject('BrainTemplate', existing))) {
      throw new ForbiddenException();
    }
    await this.repository.delete(id);
  }
}
