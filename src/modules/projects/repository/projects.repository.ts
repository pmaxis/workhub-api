import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { name: string; description?: string | null; ownerId: string }) {
    return this.database.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findManyByOwner(ownerId: string) {
    return this.database.project.findMany({
      where: { ownerId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByIdForOwner(id: string, ownerId: string) {
    return this.database.project.findFirst({
      where: { id, ownerId },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async update(id: string, data: { name?: string; description?: string | null }) {
    return this.database.project.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });
  }

  async delete(id: string) {
    return this.database.project.delete({ where: { id } });
  }
}
