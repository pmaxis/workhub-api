import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly userRolesRepository: UserRolesRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async addRole(userId: string, roleId: string): Promise<void> {
    const role = await this.rolesRepository.findByIdForCheck(roleId);
    if (role?.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot assign reserved role');
    }
    await this.userRolesRepository.addRole({ userId, roleId });
  }

  async deleteRole(userId: string, roleId: string): Promise<void> {
    const role = await this.rolesRepository.findByIdForCheck(roleId);
    if (role?.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot remove reserved role');
    }
    await this.userRolesRepository.deleteRole(userId, roleId);
  }
}
