import { Controller, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { AddPermissionDto } from '@/modules/roles/dto/add-permission.dto';

@Controller('roles/:roleId/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  addPermission(@Param('roleId') roleId: string, @Body() dto: AddPermissionDto): Promise<void> {
    return this.rolePermissionsService.addPermission(roleId, dto.permissionId);
  }

  @Delete(':permissionId')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  deletePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    return this.rolePermissionsService.deletePermission(roleId, permissionId);
  }
}
