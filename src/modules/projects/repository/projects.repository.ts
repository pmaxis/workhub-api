import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Project } from '@/infrastructure/database/generated/client';

const tasksCountInclude = {
  _count: { select: { tasks: true } },
} as const;

@Injectable()
export class ProjectsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { name: string; description?: string | null; ownerId: string }) {
    const project = await this.database.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
      },
      include: tasksCountInclude,
    });

    return this.mapProject(project);
  }

  async findAll(ownerId: string) {
    const projects = await this.database.project.findMany({
      where: { ownerId },
      include: tasksCountInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map((project) => this.mapProject(project));
  }

  async findOne(id: string, ownerId: string) {
    const project = await this.database.project.findFirst({
      where: { id, ownerId },
      include: tasksCountInclude,
    });

    if (!project) {
      return null;
    }

    return this.mapProject(project);
  }

  async update(id: string, data: { name?: string; description?: string | null }) {
    const project = await this.database.project.update({
      where: { id },
      data,
      include: tasksCountInclude,
    });

    return this.mapProject(project);
  }

  async delete(id: string): Promise<void> {
    await this.database.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });
  }

  private mapProject(
    project: Project & {
      _count: { tasks: number };
    },
  ): {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    tasksCount: number;
  } {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      tasksCount: project._count.tasks,
    };
  }
}
