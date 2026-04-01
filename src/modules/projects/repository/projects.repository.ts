import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Project } from '@/infrastructure/database/generated/client';

const tasksCountInclude = {
  _count: { select: { tasks: true } },
} as const;

type MappedProject = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasksCount: number;
};

export interface FindAllProjectsOptions {
  ability: AppAbility;
  search?: string;
  companyId?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProjectsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    name: string;
    description?: string | null;
    ownerId: string;
    companyId?: string | null;
  }) {
    const project = await this.database.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
        companyId: data.companyId ?? null,
      },
      include: tasksCountInclude,
    });

    return this.mapProject(project);
  }

  async findAll(options: FindAllProjectsOptions): Promise<PaginatedResult<MappedProject>> {
    const { ability, search, companyId, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(search ? [{ name: { contains: search, mode: 'insensitive' as const } }] : []),
        ...(companyId ? [{ companyId }] : []),
      ],
    };

    const [projects, total] = await this.database.$transaction([
      this.database.project.findMany({
        where,
        include: tasksCountInclude,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.project.count({ where }),
    ]);

    return {
      data: projects.map((p) => this.mapProject(p)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility) {
    const where: Prisma.ProjectWhereInput = { AND: [this.abilityFilter(ability), { id }] };

    const project = await this.database.project.findFirst({
      where,
      include: tasksCountInclude,
    });

    return project ? this.mapProject(project) : null;
  }

  async findOneByOwner(id: string, ownerId: string) {
    const project = await this.database.project.findFirst({
      where: { id, ownerId },
      include: tasksCountInclude,
    });

    return project ? this.mapProject(project) : null;
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

  private abilityFilter(ability: AppAbility): Prisma.ProjectWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.ProjectWhereInput>;
    return filters['Project'] ?? {};
  }

  private mapProject(project: Project & { _count: { tasks: number } }): MappedProject {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      companyId: project.companyId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      tasksCount: project._count.tasks,
    };
  }
}
