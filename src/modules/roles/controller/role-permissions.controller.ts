import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';

@Controller('roles/:roleId/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  addPermission(@Param('roleId') roleId: string, @Body() body: { permissionId: string }) {
    return this.rolePermissionsService.addPermission(roleId, body.permissionId);
  }

  @Delete(':permissionId')
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  deletePermission(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolePermissionsService.deletePermission(roleId, permissionId);
  }
}
