import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

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
    return this.database.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
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
    return this.database.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.database.user.delete({ where: { id } });
  }
}
