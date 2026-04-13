import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { Expense } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedExpense = {
  id: string;
  userId: string;
  projectId: string | null;
  description: string;
  category: string | null;
  amount: Expense['amount'];
  currency: string;
  spentAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedExpensesResult {
  data: MappedExpense[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllExpensesOptions {
  ability: AppAbility;
  projectId?: string;
  category?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

@Injectable()
export class ExpensesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    projectId: string | null;
    description: string;
    category: string | null;
    amount: Prisma.Decimal;
    currency: string;
    spentAt: Date;
    notes: string | null;
  }): Promise<MappedExpense> {
    const row = await this.database.expense.create({ data });
    return this.mapExpense(row);
  }

  async findAll(options: FindAllExpensesOptions): Promise<PaginatedExpensesResult> {
    const { ability, projectId, category, from, to, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(projectId ? [{ projectId }] : []),
        ...(category ? [{ category }] : []),
        ...(from || to
          ? [
              {
                spentAt: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              },
            ]
          : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.expense.findMany({
        where,
        orderBy: { spentAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.expense.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapExpense(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedExpense | null> {
    const where: Prisma.ExpenseWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.expense.findFirst({ where });
    return row ? this.mapExpense(row) : null;
  }

  async update(
    id: string,
    data: {
      projectId?: string | null;
      description?: string;
      category?: string | null;
      amount?: Prisma.Decimal;
      currency?: string;
      spentAt?: Date;
      notes?: string | null;
    },
  ): Promise<MappedExpense> {
    const row = await this.database.expense.update({ where: { id }, data });
    return this.mapExpense(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.expense.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.ExpenseWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.ExpenseWhereInput>;
    return filters['Expense'] ?? {};
  }

  private mapExpense(row: Expense): MappedExpense {
    return {
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      description: row.description,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      spentAt: row.spentAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
