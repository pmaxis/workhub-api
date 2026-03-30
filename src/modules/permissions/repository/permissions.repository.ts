import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Permission } from '@/infrastructure/database/generated/client';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { key: string; description?: string }) {
    const permission = await this.database.permission.create({ data });
    return this.mapPermission(permission);
  }

  async findAll() {
    const permissions = await this.database.permission.findMany({
      where: {
        key: {
          not: MANAGE_ALL_PERMISSION_KEY,
        },
      },
    });

    return permissions.map((permission) => this.mapPermission(permission));
  }

  async findOne(id: string) {
    const permission = await this.database.permission.findUnique({
      where: { id },
    });

    if (!permission || permission.key === MANAGE_ALL_PERMISSION_KEY) {
      return null;
    }

    return this.mapPermission(permission);
  }

  async update(id: string, data: { key: string; description?: string }) {
    const permission = await this.database.permission.update({
      where: { id },
      data,
    });

    return this.mapPermission(permission);
  }

  async delete(id: string): Promise<void> {
    await this.database.permission.delete({ where: { id } });
  }

  private mapPermission(permission: Permission): {
    id: string;
    key: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: permission.id,
      key: permission.key,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
