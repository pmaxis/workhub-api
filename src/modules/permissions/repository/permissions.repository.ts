import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { key: string; description?: string }) {
    return this.database.permission.create({ data });
  }

  async findAll() {
    return this.database.permission.findMany({
      where: { key: { not: MANAGE_ALL_PERMISSION_KEY } },
    });
  }

  async findById(id: string) {
    const permission = await this.database.permission.findUnique({ where: { id } });
    return permission?.key === MANAGE_ALL_PERMISSION_KEY ? null : permission;
  }

  async findByIdForCheck(id: string) {
    return this.database.permission.findUnique({ where: { id } });
  }

  async update(id: string, data: { key: string; description?: string }) {
    return this.database.permission.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.database.permission.delete({ where: { id } });
  }
}
