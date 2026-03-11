import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class RolePermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async addPermission(data: { roleId: string; permissionId: string }) {
    return this.database.rolePermission.create({ data });
  }

  async deletePermission(roleId: string, permissionId: string) {
    return this.database.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
}
