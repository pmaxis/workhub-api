import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { Payment } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedPayment = {
  id: string;
  userId: string;
  invoiceId: string | null;
  amount: Payment['amount'];
  currency: string;
  receivedAt: Date;
  method: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedPaymentsResult {
  data: MappedPayment[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllPaymentsOptions {
  ability: AppAbility;
  invoiceId?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    invoiceId: string | null;
    amount: Prisma.Decimal;
    currency: string;
    receivedAt: Date;
    method: string | null;
    notes: string | null;
  }): Promise<MappedPayment> {
    const row = await this.database.payment.create({ data });
    return this.mapPayment(row);
  }

  async findAll(options: FindAllPaymentsOptions): Promise<PaginatedPaymentsResult> {
    const { ability, invoiceId, from, to, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(invoiceId ? [{ invoiceId }] : []),
        ...(from || to
          ? [
              {
                receivedAt: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              },
            ]
          : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.payment.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.payment.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapPayment(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedPayment | null> {
    const where: Prisma.PaymentWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.payment.findFirst({ where });
    return row ? this.mapPayment(row) : null;
  }

  async update(
    id: string,
    data: {
      invoiceId?: string | null;
      amount?: Prisma.Decimal;
      currency?: string;
      receivedAt?: Date;
      method?: string | null;
      notes?: string | null;
    },
  ): Promise<MappedPayment> {
    const row = await this.database.payment.update({ where: { id }, data });
    return this.mapPayment(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.payment.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.PaymentWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.PaymentWhereInput>;
    return filters['Payment'] ?? {};
  }

  private mapPayment(row: Payment): MappedPayment {
    return {
      id: row.id,
      userId: row.userId,
      invoiceId: row.invoiceId,
      amount: row.amount,
      currency: row.currency,
      receivedAt: row.receivedAt,
      method: row.method,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
