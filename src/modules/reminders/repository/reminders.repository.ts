import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { Reminder } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedReminder = {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  remindAt: Date;
  taskId: string | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedRemindersResult {
  data: MappedReminder[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllRemindersOptions {
  ability: AppAbility;
  includeDismissed: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class RemindersRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    title: string;
    notes: string | null;
    remindAt: Date;
    taskId: string | null;
  }): Promise<MappedReminder> {
    const row = await this.database.reminder.create({ data });
    return this.mapRow(row);
  }

  async findAll(options: FindAllRemindersOptions): Promise<PaginatedRemindersResult> {
    const { ability, includeDismissed, page, limit } = options;
    const skip = (page - 1) * limit;

    const dismissedClause: Prisma.ReminderWhereInput = includeDismissed
      ? {}
      : { dismissedAt: null };

    const where: Prisma.ReminderWhereInput = {
      AND: [this.abilityFilter(ability), dismissedClause],
    };

    const [rows, total] = await Promise.all([
      this.database.reminder.findMany({
        where,
        orderBy: [{ remindAt: 'asc' }, { title: 'asc' }],
        skip,
        take: limit,
      }),
      this.database.reminder.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapRow(r)),
      total,
      page,
      limit,
    };
  }

  /** Active reminders whose `remindAt` falls in the inclusive UTC calendar range. */
  async findActiveInRemindRange(
    ability: AppAbility,
    fromDay: string,
    toDay: string,
  ): Promise<MappedReminder[]> {
    const where: Prisma.ReminderWhereInput = {
      AND: [
        this.abilityFilter(ability),
        { dismissedAt: null },
        {
          remindAt: {
            gte: this.startUtcDay(fromDay),
            lte: this.endUtcDay(toDay),
          },
        },
      ],
    };

    const rows = await this.database.reminder.findMany({
      where,
      orderBy: [{ remindAt: 'asc' }, { title: 'asc' }],
    });

    return rows.map((r) => this.mapRow(r));
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedReminder | null> {
    const where: Prisma.ReminderWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };

    const row = await this.database.reminder.findFirst({ where });
    return row ? this.mapRow(row) : null;
  }

  async update(
    id: string,
    data: {
      title?: string;
      notes?: string | null;
      remindAt?: Date;
      taskId?: string | null;
      dismissedAt?: Date | null;
    },
  ): Promise<MappedReminder> {
    const row = await this.database.reminder.update({
      where: { id },
      data,
    });
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.reminder.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.ReminderWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.ReminderWhereInput>;
    return filters['Reminder'] ?? {};
  }

  private startUtcDay(isoDate: string): Date {
    const d = isoDate.slice(0, 10);
    return new Date(`${d}T00:00:00.000Z`);
  }

  private endUtcDay(isoDate: string): Date {
    const d = isoDate.slice(0, 10);
    return new Date(`${d}T23:59:59.999Z`);
  }

  private mapRow(row: Reminder): MappedReminder {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      notes: row.notes,
      remindAt: row.remindAt,
      taskId: row.taskId,
      dismissedAt: row.dismissedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
