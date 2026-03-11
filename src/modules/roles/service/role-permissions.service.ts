import { Injectable } from '@nestjs/common';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';

@Injectable()
export class RolePermissionsService {
  constructor(private readonly rolePermissionsRepository: RolePermissionsRepository) {}

  async addPermission(roleId: string, permissionId: string) {
    return this.rolePermissionsRepository.addPermission({ roleId, permissionId });
  }

  async deletePermission(roleId: string, permissionId: string) {
    return this.rolePermissionsRepository.deletePermission(roleId, permissionId);
  }
}
