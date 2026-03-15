import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

@Injectable()
export class RolesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { slug: string; name: string }) {
    return this.database.role.create({ data });
  }

  async findAll() {
    return this.database.role.findMany({
      where: { slug: { not: ADMIN_ROLE_SLUG } },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findById(id: string) {
    const role = await this.database.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    return role?.slug === ADMIN_ROLE_SLUG ? null : role;
  }

  async findByIdForCheck(id: string) {
    return this.database.role.findUnique({ where: { id } });
  }

  async update(id: string, data: { slug: string; name: string }) {
    return this.database.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.database.role.delete({ where: { id } });
  }
}
