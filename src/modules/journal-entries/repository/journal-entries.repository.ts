import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { BrainJournalEntry } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

function startUtcDay(isoDate: string): Date {
  const d = isoDate.slice(0, 10);
  return new Date(`${d}T00:00:00.000Z`);
}

function endUtcDay(isoDate: string): Date {
  const d = isoDate.slice(0, 10);
  return new Date(`${d}T23:59:59.999Z`);
}

export type MappedJournalEntry = {
  id: string;
  userId: string;
  entryDate: Date;
  title: string | null;
  body: string;
  mood: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedJournalEntriesResult {
  data: MappedJournalEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllJournalEntriesOptions {
  ability: AppAbility;
  from?: string;
  to?: string;
  q?: string;
  page: number;
  limit: number;
}

@Injectable()
export class JournalEntriesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    entryDate: Date;
    title: string | null;
    body: string;
    mood: string | null;
  }): Promise<MappedJournalEntry> {
    const row = await this.database.brainJournalEntry.create({ data });
    return this.mapRow(row);
  }

  async findAll(options: FindAllJournalEntriesOptions): Promise<PaginatedJournalEntriesResult> {
    const { ability, from, to, q, page, limit } = options;
    const skip = (page - 1) * limit;
    const trimmedQ = q?.trim();

    let dateFilter: Prisma.BrainJournalEntryWhereInput | undefined;
    if (from && to) {
      dateFilter = { entryDate: { gte: startUtcDay(from), lte: endUtcDay(to) } };
    } else if (from) {
      dateFilter = { entryDate: { gte: startUtcDay(from) } };
    } else if (to) {
      dateFilter = { entryDate: { lte: endUtcDay(to) } };
    }

    const searchClause: Prisma.BrainJournalEntryWhereInput | undefined =
      trimmedQ && trimmedQ.length > 0
        ? {
            OR: [
              { title: { contains: trimmedQ, mode: 'insensitive' } },
              { body: { contains: trimmedQ, mode: 'insensitive' } },
              { mood: { contains: trimmedQ, mode: 'insensitive' } },
            ],
          }
        : undefined;

    const where: Prisma.BrainJournalEntryWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(dateFilter ? [dateFilter] : []),
        ...(searchClause ? [searchClause] : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.brainJournalEntry.findMany({
        where,
        orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.database.brainJournalEntry.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapRow(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedJournalEntry | null> {
    const where: Prisma.BrainJournalEntryWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.brainJournalEntry.findFirst({ where });
    return row ? this.mapRow(row) : null;
  }

  async update(
    id: string,
    data: {
      entryDate?: Date;
      title?: string | null;
      body?: string;
      mood?: string | null;
    },
  ): Promise<MappedJournalEntry> {
    const row = await this.database.brainJournalEntry.update({ where: { id }, data });
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.brainJournalEntry.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.BrainJournalEntryWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<
      string,
      Prisma.BrainJournalEntryWhereInput
    >;
    return filters['BrainJournalEntry'] ?? {};
  }

  private mapRow(row: BrainJournalEntry): MappedJournalEntry {
    return {
      id: row.id,
      userId: row.userId,
      entryDate: row.entryDate,
      title: row.title,
      body: row.body,
      mood: row.mood,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
