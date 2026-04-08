import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { TimeEntry } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedTimeEntry = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  description: string | null;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface FindAllTimeEntriesOptions {
  ability: AppAbility;
  from?: Date;
  to?: Date;
  runningOnly?: boolean;
}

@Injectable()
export class TimeEntriesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    projectId: string | null;
    taskId: string | null;
    description: string | null;
    startedAt: Date;
    endedAt: Date | null;
  }): Promise<MappedTimeEntry> {
    const entry = await this.database.timeEntry.create({
      data,
    });
    return this.mapEntry(entry);
  }

  async update(
    id: string,
    data: {
      projectId?: string | null;
      taskId?: string | null;
      description?: string | null;
      startedAt?: Date;
      endedAt?: Date | null;
    },
  ): Promise<MappedTimeEntry> {
    const entry = await this.database.timeEntry.update({
      where: { id },
      data,
    });
    return this.mapEntry(entry);
  }

  async findAll(options: FindAllTimeEntriesOptions): Promise<MappedTimeEntry[]> {
    const { ability, from, to, runningOnly } = options;

    const where: Prisma.TimeEntryWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(runningOnly ? [{ endedAt: null }] : []),
        ...(from ? [{ startedAt: { gte: from } }] : []),
        ...(to ? [{ startedAt: { lte: to } }] : []),
      ],
    };

    const rows = await this.database.timeEntry.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });

    return rows.map((e) => this.mapEntry(e));
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedTimeEntry | null> {
    const where: Prisma.TimeEntryWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };

    const entry = await this.database.timeEntry.findFirst({ where });
    return entry ? this.mapEntry(entry) : null;
  }

  async delete(id: string): Promise<void> {
    await this.database.timeEntry.delete({ where: { id } });
  }

  async closeRunningForUser(userId: string, endAt: Date): Promise<void> {
    await this.database.timeEntry.updateMany({
      where: { userId, endedAt: null },
      data: { endedAt: endAt },
    });
  }

  private abilityFilter(ability: AppAbility): Prisma.TimeEntryWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<
      string,
      Prisma.TimeEntryWhereInput
    >;
    return filters['TimeEntry'] ?? {};
  }

  private mapEntry(entry: TimeEntry): MappedTimeEntry {
    return {
      id: entry.id,
      userId: entry.userId,
      projectId: entry.projectId,
      taskId: entry.taskId,
      description: entry.description,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}
