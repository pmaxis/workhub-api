import { Injectable } from '@nestjs/common';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';

@Injectable()
export class RolePermissionsService {
  constructor(private readonly rolePermissionsRepository: RolePermissionsRepository) {}

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionsRepository.addPermission({ roleId, permissionId });
  }

  async deletePermission(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionsRepository.deletePermission(roleId, permissionId);
  }
}
