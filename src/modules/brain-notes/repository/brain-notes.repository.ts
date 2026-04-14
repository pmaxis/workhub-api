import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { BrainNote } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedBrainNote = {
  id: string;
  userId: string;
  taskId: string | null;
  title: string;
  body: string;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedBrainNotesResult {
  data: MappedBrainNote[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllBrainNotesOptions {
  ability: AppAbility;
  taskId?: string;
  q?: string;
  page: number;
  limit: number;
}

@Injectable()
export class BrainNotesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    taskId: string | null;
    title: string;
    body: string;
    tags: string | null;
  }): Promise<MappedBrainNote> {
    const row = await this.database.brainNote.create({ data });
    return this.mapBrainNote(row);
  }

  async findAll(options: FindAllBrainNotesOptions): Promise<PaginatedBrainNotesResult> {
    const { ability, taskId, q, page, limit } = options;
    const skip = (page - 1) * limit;
    const trimmedQ = q?.trim();

    const searchClause: Prisma.BrainNoteWhereInput | undefined =
      trimmedQ && trimmedQ.length > 0
        ? {
            OR: [
              { title: { contains: trimmedQ, mode: 'insensitive' } },
              { body: { contains: trimmedQ, mode: 'insensitive' } },
            ],
          }
        : undefined;

    const where: Prisma.BrainNoteWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(taskId ? [{ taskId }] : []),
        ...(searchClause ? [searchClause] : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.brainNote.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.brainNote.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapBrainNote(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedBrainNote | null> {
    const where: Prisma.BrainNoteWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.brainNote.findFirst({ where });
    return row ? this.mapBrainNote(row) : null;
  }

  async update(
    id: string,
    data: {
      title?: string;
      body?: string;
      tags?: string | null;
      taskId?: string | null;
    },
  ): Promise<MappedBrainNote> {
    const row = await this.database.brainNote.update({ where: { id }, data });
    return this.mapBrainNote(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.brainNote.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.BrainNoteWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<
      string,
      Prisma.BrainNoteWhereInput
    >;
    return filters['BrainNote'] ?? {};
  }

  private mapBrainNote(row: BrainNote): MappedBrainNote {
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
