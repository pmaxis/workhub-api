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
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { AddRoleDto } from '@/modules/users/dto/add-role.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiCreatedResponse({ description: 'Role assigned (empty response body)' })
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  addRole(
    @Param('userId') userId: string,
    @Body() dto: AddRoleDto,
    @CurrentUserId() actorUserId: string,
  ): Promise<void> {
    return this.userRolesService.addRole(userId, dto.roleId, actorUserId);
  }

  @Delete(':roleId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiNoContentResponse({ description: 'Role removed' })
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  deleteRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUserId() actorUserId: string,
  ): Promise<void> {
    return this.userRolesService.deleteRole(userId, roleId, actorUserId);
  }
}
