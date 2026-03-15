import { BadRequestException, Injectable } from '@nestjs/common';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

@Injectable()
export class RolePermissionsService {
  constructor(
    private readonly rolePermissionsRepository: RolePermissionsRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    const permission = await this.permissionsRepository.findByIdForCheck(permissionId);
    if (permission?.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot assign reserved permission');
    }
    await this.rolePermissionsRepository.addPermission({ roleId, permissionId });
  }

  async deletePermission(roleId: string, permissionId: string): Promise<void> {
    const permission = await this.permissionsRepository.findByIdForCheck(permissionId);
    if (permission?.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot remove reserved permission');
    }
    await this.rolePermissionsRepository.deletePermission(roleId, permissionId);
  }
}
