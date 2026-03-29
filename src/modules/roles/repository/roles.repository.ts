import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Permission } from '@/infrastructure/database/generated/client';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

const permissionsInclude = {
  permissions: {
    include: { permission: true },
  },
} as const;

@Injectable()
export class RolesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { slug: string; name: string }) {
    const role = await this.database.role.create({
      data,
      include: permissionsInclude,
    });

    return this.mapRole(role);
  }

  async findAll() {
    const roles = await this.database.role.findMany({
      where: { slug: { not: ADMIN_ROLE_SLUG } },
      include: permissionsInclude,
    });

    return roles.map((role) => this.mapRole(role));
  }

  async findOne(id: string) {
    const role = await this.database.role.findUnique({
      where: { id },
      include: permissionsInclude,
    });

    if (!role || role.slug === ADMIN_ROLE_SLUG) {
      return null;
    }

    return this.mapRole(role);
  }

  async findBySlug(slug: string): Promise<{ id: string; slug: string; name: string } | null> {
    const role = await this.database.role.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true },
    });
    return role as { id: string; slug: string; name: string } | null;
  }

  async update(id: string, data: { slug: string; name: string }) {
    const role = await this.database.role.update({
      where: { id },
      data,
      include: permissionsInclude,
    });

    return this.mapRole(role);
  }

  async delete(id: string): Promise<void> {
    await this.database.role.delete({ where: { id } });
  }

  private mapRole(role: {
    id: string;
    slug: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    permissions: { permission: Permission }[];
  }): {
    id: string;
    slug: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    permissions: Permission[];
  } {
    return {
      id: role.id,
      slug: role.slug,
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((rp) => rp.permission),
    };
  }
}
