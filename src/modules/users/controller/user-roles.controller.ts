import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { UserRolesService } from '@/modules/users/service/user-roles.service';

@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  addRole(@Param('userId') userId: string, @Body() body: { roleId: string }) {
    return this.userRolesService.addRole(userId, body.roleId);
  }

  @Delete(':roleId')
  deleteRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.deleteRole(userId, roleId);
  }
}
