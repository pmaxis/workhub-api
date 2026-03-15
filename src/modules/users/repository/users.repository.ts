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
  }) {
    return this.database.user.create({ data });
  }

  async findAll() {
    return this.database.user.findMany({
      where: {
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
  }

  async findOne(id: string) {
    const user = await this.database.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) return null;
    const hasAdminRole = user.roles.some((ur) => ur.role.slug === ADMIN_ROLE_SLUG);
    return hasAdminRole ? null : user;
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
    return this.database.user.update({
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
  }

  async delete(id: string): Promise<void> {
    await this.database.user.delete({ where: { id } });
  }
}
