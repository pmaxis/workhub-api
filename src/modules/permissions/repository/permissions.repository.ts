import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { key: string; description?: string }) {
    return this.database.permission.create({ data });
  }

  async findAll() {
    return this.database.permission.findMany();
  }

  async findById(id: string) {
    return this.database.permission.findUnique({ where: { id } });
  }

  async update(id: string, data: { key: string; description?: string }) {
    return this.database.permission.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.database.permission.delete({ where: { id } });
  }
}
