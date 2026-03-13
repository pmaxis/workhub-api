import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { UserRolesService } from '@/modules/users/service/user-roles.service';

@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  async addRole(@Param('userId') userId: string, @Body() body: { roleId: string }): Promise<void> {
    await this.userRolesService.addRole(userId, body.roleId);
  }

  @Delete(':roleId')
  @CheckPolicies((ability) => ability.can(Action.Manage, 'UserRole'))
  async deleteRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<void> {
    await this.userRolesService.deleteRole(userId, roleId);
  }
}
