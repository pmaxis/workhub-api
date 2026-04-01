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
}

@Injectable()
export class TasksRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    projectId: string;
    projectOwnerId: string;
    projectCompanyId: string | null;
    assigneeId: string;
  }) {
    const task = await this.database.task.create({ data });
    return this.mapTask(task);
  }

  async findAll(options: FindAllTasksOptions): Promise<MappedTask[]> {
    const { ability, projectId } = options;

    const where: Prisma.TaskWhereInput = {
      AND: [this.abilityFilter(ability), ...(projectId ? [{ projectId }] : [])],
    };

    const tasks = await this.database.task.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
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

  private abilityFilter(ability: AppAbility): Prisma.TaskWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.TaskWhereInput>;
    return filters['Task'] ?? {};
  }

  private mapTask(task: Task): MappedTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      projectOwnerId: task.projectOwnerId,
      projectCompanyId: task.projectCompanyId,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
