import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

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
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      ...user,
      roles: user.roles.map((ur) => ur.role),
    };
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
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((u) => ({
      ...u,
      roles: u.roles.map((ur) => ur.role),
    }));
  }

  async findOne(id: string) {
    const user = await this.database.user.findFirst({
      where: {
        id,
        roles: {
          none: { role: { slug: ADMIN_ROLE_SLUG } },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      roles: user.roles.map((ur) => ur.role),
    };
  }

  async findOneByEmail(email: string) {
    return this.database.user.findUnique({ where: { email } });
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
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      ...user,
      roles: user.roles.map((ur) => ur.role),
    };
  }

  async delete(id: string): Promise<void> {
    await this.database.user.delete({ where: { id } });
  }
}
