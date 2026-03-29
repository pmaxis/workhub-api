import { BadRequestException, Injectable } from '@nestjs/common';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';
import { RolesService } from '@/modules/roles/service/roles.service';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    private readonly rolePermissionsRepository: RolePermissionsRepository,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    await this.rolesService.findOne(roleId);

    const permission = await this.permissionsService.findOne(permissionId);

    if (permission.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot assign reserved permission');
    }

    await this.rolePermissionsRepository.addPermission({ roleId, permissionId });
  }

  async deletePermission(roleId: string, permissionId: string): Promise<void> {
    await this.rolesService.findOne(roleId);

    const permission = await this.permissionsService.findOne(permissionId);

    if (permission.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot remove reserved permission');
    }

    await this.rolePermissionsRepository.deletePermission(roleId, permissionId);
  }
}
