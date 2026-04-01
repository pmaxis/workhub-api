import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly database: DatabaseService) {}

  private readonly rolesInclude = {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: { select: { key: true } } },
            },
          },
        },
      },
    },
  } as const;

  async findById(id: string) {
    return this.database.user.findUnique({
      where: { id },
      include: this.rolesInclude,
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      thirdName?: string;
    },
  ) {
    return this.database.user.update({
      where: { id },
      data,
      include: this.rolesInclude,
    });
  }
}
