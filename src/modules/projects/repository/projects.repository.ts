import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    name: string;
    description?: string | null;
    freelancerProfileId: string;
    clientProfileId?: string | null;
  }) {
    return this.database.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        freelancerProfileId: data.freelancerProfileId,
        clientProfileId: data.clientProfileId ?? null,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findManyByFreelancer(freelancerProfileId: string) {
    return this.database.project.findMany({
      where: { freelancerProfileId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByIdForFreelancer(id: string, freelancerProfileId: string) {
    return this.database.project.findFirst({
      where: { id, freelancerProfileId },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null; clientProfileId?: string | null },
  ) {
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
