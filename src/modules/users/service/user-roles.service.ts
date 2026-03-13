import { Injectable } from '@nestjs/common';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';

@Injectable()
export class UserRolesService {
  constructor(private readonly userRolesRepository: UserRolesRepository) {}

  async addRole(userId: string, roleId: string): Promise<void> {
    await this.userRolesRepository.addRole({ userId, roleId });
  }

  async deleteRole(userId: string, roleId: string): Promise<void> {
    await this.userRolesRepository.deleteRole(userId, roleId);
  }
}
