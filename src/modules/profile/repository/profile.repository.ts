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

  private readonly profileInclude = {
    ...this.rolesInclude,
    freelancerProfile: { select: { id: true } },
    clientProfile: {
      select: {
        companyMembers: { select: { companyId: true } },
      },
    },
  } as const;

  async findById(id: string) {
    return this.database.user.findUnique({
      where: { id },
      include: this.profileInclude,
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
      include: this.profileInclude,
    });
  }
}
