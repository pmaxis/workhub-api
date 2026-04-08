import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateTimeEntryDto } from '@/modules/time-entries/dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '@/modules/time-entries/dto/update-time-entry.dto';
import { TimeEntryResponseDto } from '@/modules/time-entries/dto/time-entry-response.dto';
import { TimeEntriesRepository } from '@/modules/time-entries/repository/time-entries.repository';

@Injectable()
export class TimeEntriesService {
  constructor(
    private readonly timeEntriesRepository: TimeEntriesRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateTimeEntryDto,
  ): Promise<TimeEntryResponseDto> {
    const startedAt = new Date(dto.startedAt);
    const endedAt =
      dto.endedAt !== undefined && dto.endedAt !== null && dto.endedAt !== ''
        ? new Date(dto.endedAt)
        : null;

    if (endedAt && endedAt < startedAt) {
      throw new BadRequestException('endedAt must be on or after startedAt');
    }

    const { projectId, taskId } = await this.resolveProjectAndTask(
      ability,
      dto.projectId ?? null,
      dto.taskId ?? null,
    );

    if (endedAt === null) {
      await this.timeEntriesRepository.closeRunningForUser(userId, startedAt);
    }

    const entry = await this.timeEntriesRepository.create({
      userId,
      projectId,
      taskId,
      description: dto.description?.trim() ? dto.description.trim() : null,
      startedAt,
      endedAt,
    });

    return new TimeEntryResponseDto(entry);
  }

  async findAll(
    ability: AppAbility,
    query: { from?: string; to?: string; runningOnly?: boolean },
  ): Promise<TimeEntryResponseDto[]> {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    const entries = await this.timeEntriesRepository.findAll({
      ability,
      from,
      to,
      runningOnly: query.runningOnly,
    });

    return entries.map((e) => new TimeEntryResponseDto(e));
  }

  async findRunning(ability: AppAbility): Promise<TimeEntryResponseDto | null> {
    const entries = await this.timeEntriesRepository.findAll({
      ability,
      runningOnly: true,
    });
    const latest = entries.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];
    return latest ? new TimeEntryResponseDto(latest) : null;
  }

  async findOne(id: string, ability: AppAbility): Promise<TimeEntryResponseDto> {
    const entry = await this.timeEntriesRepository.findOne(id, ability);

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return new TimeEntryResponseDto(entry);
  }

  async update(
    id: string,
    userId: string,
    ability: AppAbility,
    dto: UpdateTimeEntryDto,
  ): Promise<TimeEntryResponseDto> {
    const entry = await this.timeEntriesRepository.findOne(id, ability);

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (!ability.can(Action.Update, subject('TimeEntry', entry))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new TimeEntryResponseDto(entry);
    }

    let startedAt = entry.startedAt;
    let endedAt = entry.endedAt;

    if (dto.startedAt !== undefined) {
      startedAt = new Date(dto.startedAt);
    }
    if (dto.endedAt !== undefined) {
      endedAt = dto.endedAt === null || dto.endedAt === '' ? null : new Date(dto.endedAt);
    }

    if (endedAt && endedAt < startedAt) {
      throw new BadRequestException('endedAt must be on or after startedAt');
    }

    let nextProjectId = entry.projectId;
    let nextTaskId = entry.taskId;

    if (dto.projectId !== undefined) {
      nextProjectId = dto.projectId;
    }
    if (dto.taskId !== undefined) {
      nextTaskId = dto.taskId;
    }

    if (dto.projectId !== undefined || dto.taskId !== undefined) {
      const resolved = await this.resolveProjectAndTask(ability, nextProjectId, nextTaskId);
      nextProjectId = resolved.projectId;
      nextTaskId = resolved.taskId;
    }

    if (endedAt === null && entry.endedAt !== null) {
      await this.timeEntriesRepository.closeRunningForUser(userId, startedAt);
    }

    const patch: {
      projectId?: string | null;
      taskId?: string | null;
      description?: string | null;
      startedAt?: Date;
      endedAt?: Date | null;
    } = {};

    if (dto.startedAt !== undefined) {
      patch.startedAt = startedAt;
    }
    if (dto.endedAt !== undefined) {
      patch.endedAt = endedAt;
    }
    if (dto.description !== undefined) {
      patch.description = dto.description?.trim() ? dto.description.trim() : null;
    }
    if (dto.projectId !== undefined || dto.taskId !== undefined) {
      patch.projectId = nextProjectId;
      patch.taskId = nextTaskId;
    }

    const updated = await this.timeEntriesRepository.update(id, patch);
    return new TimeEntryResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const entry = await this.timeEntriesRepository.findOne(id, ability);

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (!ability.can(Action.Delete, subject('TimeEntry', entry))) {
      throw new ForbiddenException();
    }

    await this.timeEntriesRepository.delete(id);
  }

  private async resolveProjectAndTask(
    ability: AppAbility,
    projectId: string | null,
    taskId: string | null,
  ): Promise<{ projectId: string | null; taskId: string | null }> {
    let resolvedProjectId = projectId;
    const resolvedTaskId = taskId;

    if (resolvedTaskId) {
      const task = await this.tasksRepository.findOne(resolvedTaskId, ability);
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      if (resolvedProjectId && resolvedProjectId !== task.projectId) {
        throw new BadRequestException('taskId does not belong to the given projectId');
      }
      if (!resolvedProjectId) {
        resolvedProjectId = task.projectId;
      }
    }

    if (resolvedProjectId) {
      const project = await this.projectsRepository.findOne(resolvedProjectId, ability);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    return { projectId: resolvedProjectId, taskId: resolvedTaskId };
  }
}
