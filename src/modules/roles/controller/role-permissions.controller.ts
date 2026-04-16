import { Controller, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { AddPermissionDto } from '@/modules/roles/dto/add-permission.dto';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles/:roleId/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Attach permission to role' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiCreatedResponse({ description: 'Permission linked (empty body)' })
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  addPermission(
    @Param('roleId') roleId: string,
    @Body() dto: AddPermissionDto,
    @CurrentUserId() actorUserId: string,
  ): Promise<void> {
    return this.rolePermissionsService.addPermission(roleId, dto.permissionId, actorUserId);
  }

  @Delete(':permissionId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiParam({ name: 'permissionId', description: 'Permission ID' })
  @ApiNoContentResponse({ description: 'Permission unlinked' })
  @CheckPolicies((ability) => ability.can(Action.Manage, 'RolePermission'))
  deletePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @CurrentUserId() actorUserId: string,
  ): Promise<void> {
    return this.rolePermissionsService.deletePermission(roleId, permissionId, actorUserId);
  }
}
