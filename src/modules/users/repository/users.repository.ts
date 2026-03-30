import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Role } from '@/infrastructure/database/generated/client';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

const rolesInclude = {
  roles: {
    include: {
      role: true,
    },
  },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    email: string;
    password: string;
    lastName: string;
    firstName: string;
    thirdName?: string;
    isActivated?: boolean;
  }) {
    const user = await this.database.user.create({
      data,
      include: rolesInclude,
    });

    return this.mapUser(user);
  }

  async findAll() {
    const users = await this.database.user.findMany({
      where: {
        roles: {
          none: {
            role: {
              slug: ADMIN_ROLE_SLUG,
            },
          },
        },
      },
      include: rolesInclude,
    });

    return users.map((user) => this.mapUser(user));
  }

  async findOne(id: string) {
    const user = await this.database.user.findUnique({
      where: {
        id,
        roles: {
          none: {
            role: {
              slug: ADMIN_ROLE_SLUG,
            },
          },
        },
      },
      include: rolesInclude,
    });

    if (!user) {
      return null;
    }

    return this.mapUser(user);
  }

  async findOneByEmail(email: string) {
    return this.database.user.findUnique({ where: { email } });
  }

  async findByEmailsForInvitationLookup(emails: string[]) {
    if (emails.length === 0) {
      return [];
    }

    return this.database.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, firstName: true, lastName: true, thirdName: true, createdAt: true },
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      password?: string;
      lastName?: string;
      firstName?: string;
      thirdName?: string;
    },
  ) {
    const user = await this.database.user.update({
      where: { id },
      data,
      include: rolesInclude,
    });

    return this.mapUser(user);
  }

  async delete(id: string): Promise<void> {
    await this.database.user.delete({ where: { id } });
  }

  private mapUser(user: {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
    thirdName: string | null;
    isActivated: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: { role: Role }[];
  }): {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
    thirdName: string | null;
    isActivated: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: Role[];
  } {
    return {
      id: user.id,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      thirdName: user.thirdName,
      isActivated: user.isActivated,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map((ur) => ur.role),
    };
  }
}
