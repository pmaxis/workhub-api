import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { slug: string; name: string }) {
    return this.database.role.create({ data });
  }

  async findAll() {
    return this.database.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.database.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: string, data: { slug: string; name: string }) {
    return this.database.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.database.role.delete({ where: { id } });
  }
}
