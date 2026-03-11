import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class UserPermissionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async getPermissionKeysByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.database.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            permissions: {
              select: { permission: { select: { key: true } } },
            },
          },
        },
      },
    });

    const keys = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        keys.add(rp.permission.key);
      }
    }
    return Array.from(keys);
  }
}
