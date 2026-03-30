import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Task } from '@/infrastructure/database/generated/client';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    projectId: string;
    assigneeId: string;
  }) {
    const task = await this.database.task.create({ data });
    return this.mapTask(task);
  }

  async findAll(userId: string, projectId?: string) {
    const tasks = await this.database.task.findMany({
      where: {
        project: {
          ownerId: userId,
          ...(projectId ? { id: projectId } : {}),
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return tasks.map((task) => this.mapTask(task));
  }

  async findOne(id: string, userId: string) {
    const task = await this.database.task.findUnique({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!task) {
      return null;
    }

    return this.mapTask(task);
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

  private mapTask(task: Task): {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    projectId: string;
    assigneeId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
