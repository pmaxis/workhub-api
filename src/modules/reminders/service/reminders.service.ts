import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateReminderDto } from '@/modules/reminders/dto/create-reminder.dto';
import { UpdateReminderDto } from '@/modules/reminders/dto/update-reminder.dto';
import { QueryRemindersDto } from '@/modules/reminders/dto/query-reminders.dto';
import { ReminderResponseDto } from '@/modules/reminders/dto/reminder-response.dto';
import { PaginatedRemindersResponseDto } from '@/modules/reminders/dto/paginated-reminders-response.dto';
import { RemindersRepository } from '@/modules/reminders/repository/reminders.repository';
import type { MappedReminder } from '@/modules/reminders/repository/reminders.repository';

@Injectable()
export class RemindersService {
  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const taskId = await this.resolveOptionalTaskId(dto.taskId, ability);

    const row = await this.remindersRepository.create({
      userId,
      title: dto.title.trim(),
      notes: dto.notes?.trim() ? dto.notes.trim() : null,
      remindAt: new Date(dto.remindAt),
      taskId,
    });

    return this.toDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: QueryRemindersDto,
  ): Promise<PaginatedRemindersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const includeDismissed = query.includeDismissed === true;

    const result = await this.remindersRepository.findAll({
      ability,
      includeDismissed,
      page,
      limit,
    });

    return {
      data: result.data.map((r) => this.toDto(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<ReminderResponseDto> {
    const row = await this.remindersRepository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Reminder not found');
    }
    return this.toDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    const existing = await this.remindersRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }

    if (!ability.can(Action.Update, subject('Reminder', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return this.toDto(existing);
    }

    let taskId: string | null | undefined = existing.taskId;
    if (dto.taskId !== undefined) {
      if (dto.taskId === null) {
        taskId = null;
      } else {
        const resolved = await this.resolveOptionalTaskId(dto.taskId, ability);
        taskId = resolved;
      }
    }

    const payload: {
      title?: string;
      notes?: string | null;
      remindAt?: Date;
      taskId?: string | null;
      dismissedAt?: Date | null;
    } = {};

    if (dto.title !== undefined) payload.title = dto.title.trim();
    if (dto.notes !== undefined) {
      payload.notes = dto.notes === null ? null : dto.notes.trim() ? dto.notes.trim() : null;
    }
    if (dto.remindAt !== undefined) payload.remindAt = new Date(dto.remindAt);
    if (dto.taskId !== undefined) payload.taskId = taskId ?? null;
    if (dto.dismissedAt !== undefined) {
      payload.dismissedAt = dto.dismissedAt === null ? null : new Date(dto.dismissedAt);
    }

    const updated = await this.remindersRepository.update(id, payload);
    return this.toDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.remindersRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }
    if (!ability.can(Action.Delete, subject('Reminder', existing))) {
      throw new ForbiddenException();
    }
    await this.remindersRepository.delete(id);
  }

  private async resolveOptionalTaskId(
    taskId: string | undefined,
    ability: AppAbility,
  ): Promise<string | null> {
    if (!taskId?.trim()) {
      return null;
    }
    const task = await this.tasksRepository.findOne(taskId.trim(), ability);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task.id;
  }

  private toDto(row: MappedReminder): ReminderResponseDto {
    return new ReminderResponseDto({
      id: row.id,
      title: row.title,
      notes: row.notes,
      remindAt: row.remindAt,
      taskId: row.taskId,
      dismissedAt: row.dismissedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
