import { Controller, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { AddRoleDto } from '@/modules/users/dto/add-role.dto';

@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  addRole(@Param('userId') userId: string, @Body() dto: AddRoleDto): Promise<void> {
    return this.userRolesService.addRole(userId, dto.roleId);
  }

  @Delete(':roleId')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  deleteRole(@Param('userId') userId: string, @Param('roleId') roleId: string): Promise<void> {
    return this.userRolesService.deleteRole(userId, roleId);
  }
}
