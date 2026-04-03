import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';
import { UsersService } from '@/modules/users/service/users.service';
import { RolesService } from '@/modules/roles/service/roles.service';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly userRolesRepository: UserRolesRepository,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async addRole(userId: string, roleId: string): Promise<void> {
    await this.usersService.findOne(userId);

    const role = await this.rolesService.findOne(roleId);

    if (role?.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot assign reserved role');
    }

    await this.userRolesRepository.addRole({ userId, roleId });
  }

  async deleteRole(userId: string, roleId: string): Promise<void> {
    await this.usersService.findOne(userId);

    const role = await this.rolesService.findOne(roleId);

    if (role?.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot remove reserved role');
    }

    await this.userRolesRepository.deleteRole(userId, roleId);
  }

  async addRoleBySlug(userId: string, slug: string): Promise<void> {
    const roleId = await this.rolesService.findIdBySlug(slug);
    if (!roleId) {
      return;
    }

    await this.addRole(userId, roleId);
  }
}
