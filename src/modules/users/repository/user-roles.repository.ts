import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class UserRolesRepository {
  constructor(private readonly database: DatabaseService) {}

  async addRole(data: { userId: string; roleId: string }) {
    return this.database.userRole.create({ data });
  }

  async deleteRole(userId: string, roleId: string) {
    return this.database.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }
}
