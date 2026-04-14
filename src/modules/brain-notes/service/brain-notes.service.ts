import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateBrainNoteDto } from '@/modules/brain-notes/dto/create-brain-note.dto';
import { UpdateBrainNoteDto } from '@/modules/brain-notes/dto/update-brain-note.dto';
import { BrainNoteResponseDto } from '@/modules/brain-notes/dto/brain-note-response.dto';
import { PaginatedBrainNotesResponseDto } from '@/modules/brain-notes/dto/paginated-brain-notes-response.dto';
import { BrainNotesRepository } from '@/modules/brain-notes/repository/brain-notes.repository';

@Injectable()
export class BrainNotesService {
  constructor(
    private readonly brainNotesRepository: BrainNotesRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateBrainNoteDto,
  ): Promise<BrainNoteResponseDto> {
    let taskId: string | null = null;
    if (dto.taskId) {
      const task = await this.tasksRepository.findOne(dto.taskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      taskId = task.id;
    }

    const row = await this.brainNotesRepository.create({
      userId,
      taskId,
      title: dto.title.trim(),
      body: dto.body ?? '',
      tags: dto.tags?.trim() ? dto.tags.trim() : null,
    });
    return new BrainNoteResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: { taskId?: string; q?: string; page?: number; limit?: number },
  ): Promise<PaginatedBrainNotesResponseDto> {
    const result = await this.brainNotesRepository.findAll({
      ability,
      taskId: query.taskId,
      q: query.q,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new BrainNoteResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<BrainNoteResponseDto> {
    const row = await this.brainNotesRepository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Note not found');
    }
    return new BrainNoteResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateBrainNoteDto,
  ): Promise<BrainNoteResponseDto> {
    const existing = await this.brainNotesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Note not found');
    }
    if (!ability.can(Action.Update, subject('BrainNote', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new BrainNoteResponseDto(existing);
    }

    if (dto.taskId !== undefined && dto.taskId !== null) {
      const task = await this.tasksRepository.findOne(dto.taskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    const patch: Parameters<BrainNotesRepository['update']>[1] = {};
    if (dto.title !== undefined) patch.title = dto.title.trim();
    if (dto.body !== undefined) patch.body = dto.body ?? '';
    if (dto.tags !== undefined) {
      patch.tags = dto.tags === null || dto.tags.trim() === '' ? null : dto.tags.trim();
    }
    if (dto.taskId !== undefined) patch.taskId = dto.taskId;

    const updated = await this.brainNotesRepository.update(id, patch);
    return new BrainNoteResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.brainNotesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Note not found');
    }
    if (!ability.can(Action.Delete, subject('BrainNote', existing))) {
      throw new ForbiddenException();
    }
    await this.brainNotesRepository.delete(id);
  }
}
