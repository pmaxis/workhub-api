import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
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
    return this.database.task.create({ data });
  }

  async findManyByProjectOwner(ownerId: string, projectId?: string) {
    return this.database.task.findMany({
      where: {
        project: { ownerId },
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByIdForProjectOwner(id: string, ownerId: string) {
    return this.database.task.findFirst({
      where: { id, project: { ownerId } },
    });
  }

  async update(
    id: string,
    data: { title?: string; description?: string | null; status?: TaskStatus },
  ) {
    return this.database.task.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.database.task.delete({ where: { id } });
  }
}
