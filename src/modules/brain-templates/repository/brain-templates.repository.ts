import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { BrainTemplate } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedBrainTemplate = {
  id: string;
  userId: string;
  taskId: string | null;
  title: string;
  body: string;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedBrainTemplatesResult {
  data: MappedBrainTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllBrainTemplatesOptions {
  ability: AppAbility;
  taskId?: string;
  q?: string;
  page: number;
  limit: number;
}

@Injectable()
export class BrainTemplatesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    taskId: string | null;
    title: string;
    body: string;
    tags: string | null;
  }): Promise<MappedBrainTemplate> {
    const row = await this.database.brainTemplate.create({ data });
    return this.mapRow(row);
  }

  async findAll(options: FindAllBrainTemplatesOptions): Promise<PaginatedBrainTemplatesResult> {
    const { ability, taskId, q, page, limit } = options;
    const skip = (page - 1) * limit;
    const trimmedQ = q?.trim();

    const searchClause: Prisma.BrainTemplateWhereInput | undefined =
      trimmedQ && trimmedQ.length > 0
        ? {
            OR: [
              { title: { contains: trimmedQ, mode: 'insensitive' } },
              { body: { contains: trimmedQ, mode: 'insensitive' } },
            ],
          }
        : undefined;

    const where: Prisma.BrainTemplateWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(taskId ? [{ taskId }] : []),
        ...(searchClause ? [searchClause] : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.brainTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.brainTemplate.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapRow(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedBrainTemplate | null> {
    const where: Prisma.BrainTemplateWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.brainTemplate.findFirst({ where });
    return row ? this.mapRow(row) : null;
  }

  async update(
    id: string,
    data: {
      title?: string;
      body?: string;
      tags?: string | null;
      taskId?: string | null;
    },
  ): Promise<MappedBrainTemplate> {
    const row = await this.database.brainTemplate.update({ where: { id }, data });
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.brainTemplate.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.BrainTemplateWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<
      string,
      Prisma.BrainTemplateWhereInput
    >;
    return filters['BrainTemplate'] ?? {};
  }

  private mapRow(row: BrainTemplate): MappedBrainTemplate {
    return {
      id: row.id,
      userId: row.userId,
      taskId: row.taskId,
      title: row.title,
      body: row.body,
      tags: row.tags,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
