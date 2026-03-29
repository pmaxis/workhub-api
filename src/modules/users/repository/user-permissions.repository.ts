import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class UserPermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async getPermissionKeysByUserId(userId: string): Promise<string[]> {
    const permissions = await this.database.permission.findMany({
      where: {
        roles: {
          some: {
            role: {
              users: {
                some: { userId },
              },
            },
          },
        },
      },
      select: { key: true },
    });

    return [...new Set(permissions.map((p) => p.key))];
  }
}
