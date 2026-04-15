import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Task } from '@/infrastructure/database/generated/client';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueAt: Date | null;
  projectId: string;
  projectOwnerId: string;
  projectCompanyId: string | null;
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface FindAllTasksOptions {
  ability: AppAbility;
  projectId?: string;
  /** Inclusive calendar day (YYYY-MM-DD), UTC bounds */
  dueFrom?: string;
  /** Inclusive calendar day (YYYY-MM-DD), UTC bounds */
  dueTo?: string;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    dueAt?: Date | null;
    projectId: string;
    projectOwnerId: string;
    projectCompanyId: string | null;
    assigneeId: string;
  }) {
    const task = await this.database.task.create({ data });
    return this.mapTask(task);
  }

  async findAll(options: FindAllTasksOptions): Promise<MappedTask[]> {
    const { ability, projectId, dueFrom, dueTo } = options;

    const dueFilter = this.buildDueDateFilter(dueFrom, dueTo);

    const where: Prisma.TaskWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(projectId ? [{ projectId }] : []),
        ...(dueFilter ? [dueFilter] : []),
      ],
    };

    const tasks = await this.database.task.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return tasks.map((task) => this.mapTask(task));
  }

  /** Tasks with a due date in [from, to] (calendar days, UTC), `dueAt` not null. */
  async findByDueDateRange(
    ability: AppAbility,
    dueFrom: string,
    dueTo: string,
  ): Promise<MappedTask[]> {
    const where: Prisma.TaskWhereInput = {
      AND: [this.abilityFilter(ability), this.buildDueDateFilter(dueFrom, dueTo) ?? {}],
    };

    const tasks = await this.database.task.findMany({
      where,
      orderBy: [{ dueAt: 'asc' }, { title: 'asc' }],
    });

    return tasks.map((task) => this.mapTask(task));
  }

  /**
   * Incomplete tasks with `dueAt` set, ordered by due date (soonest first).
   * Includes overdue; caps at `take` rows.
   */
  async findOpenDeadlines(
    ability: AppAbility,
    horizonEnd: Date,
    take: number,
  ): Promise<MappedTask[]> {
    const where: Prisma.TaskWhereInput = {
      AND: [
        this.abilityFilter(ability),
        {
          status: { not: TaskStatus.COMPLETED },
          dueAt: { not: null, lte: horizonEnd },
        },
      ],
    };

    const tasks = await this.database.task.findMany({
      where,
      orderBy: [{ dueAt: 'asc' }, { title: 'asc' }],
      take,
    });

    return tasks.map((task) => this.mapTask(task));
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedTask | null> {
    const where: Prisma.TaskWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };

    const task = await this.database.task.findFirst({
      where,
    });

    return task ? this.mapTask(task) : null;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      dueAt?: Date | null;
    },
  ) {
    const task = await this.database.task.update({
      where: { id },
      data,
    });

    return this.mapTask(task);
  }

  async delete(id: string): Promise<void> {
    await this.database.task.delete({ where: { id } });
  }

  /** Sums time-entry duration per task for the given user (running entries use “now” as end). */
  async sumTrackedDurationSecondsForUser(
    userId: string,
    taskIds: string[],
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (taskIds.length === 0) {
      return map;
    }

    const rows = await this.database.timeEntry.findMany({
      where: { userId, taskId: { in: taskIds } },
      select: { taskId: true, startedAt: true, endedAt: true },
    });

    const now = Date.now();
    for (const row of rows) {
      if (!row.taskId) continue;
      const start = row.startedAt.getTime();
      const end = row.endedAt ? row.endedAt.getTime() : now;
      const sec = Math.max(0, Math.floor((end - start) / 1000));
      map.set(row.taskId, (map.get(row.taskId) ?? 0) + sec);
    }

    return map;
  }

  private abilityFilter(ability: AppAbility): Prisma.TaskWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.TaskWhereInput>;
    return filters['Task'] ?? {};
  }

  private buildDueDateFilter(dueFrom?: string, dueTo?: string): Prisma.TaskWhereInput | undefined {
    const from = dueFrom?.trim();
    const to = dueTo?.trim();
    if (!from && !to) {
      return undefined;
    }
    if (from && to) {
      return {
        dueAt: {
          not: null,
          gte: this.startUtcDay(from),
          lte: this.endUtcDay(to),
        },
      };
    }
    if (from) {
      return { dueAt: { not: null, gte: this.startUtcDay(from) } };
    }
    return { dueAt: { not: null, lte: this.endUtcDay(to!) } };
  }

  private startUtcDay(isoDate: string): Date {
    const d = isoDate.slice(0, 10);
    return new Date(`${d}T00:00:00.000Z`);
  }

  private endUtcDay(isoDate: string): Date {
    const d = isoDate.slice(0, 10);
    return new Date(`${d}T23:59:59.999Z`);
  }

  private mapTask(task: Task): MappedTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueAt: task.dueAt,
      projectId: task.projectId,
      projectOwnerId: task.projectOwnerId,
      projectCompanyId: task.projectCompanyId,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
