import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';

@Controller('roles/:roleId/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  addPermission(@Param('roleId') roleId: string, @Body() body: { permissionId: string }) {
    return this.rolePermissionsService.addPermission(roleId, body.permissionId);
  }

  @Delete(':permissionId')
  deletePermission(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolePermissionsService.deletePermission(roleId, permissionId);
  }
}
