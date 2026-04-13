import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { Invoice } from '@/infrastructure/database/generated/client';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type MappedInvoice = {
  id: string;
  userId: string;
  projectId: string | null;
  number: string;
  title: string | null;
  amount: Invoice['amount'];
  currency: string;
  status: InvoiceStatus;
  issuedAt: Date | null;
  dueAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedInvoicesResult {
  data: MappedInvoice[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllInvoicesOptions {
  ability: AppAbility;
  projectId?: string;
  status?: InvoiceStatus;
  page: number;
  limit: number;
}

@Injectable()
export class InvoicesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    projectId: string | null;
    number: string;
    title: string | null;
    amount: Prisma.Decimal;
    currency: string;
    status: InvoiceStatus;
    issuedAt: Date | null;
    dueAt: Date | null;
    notes: string | null;
  }): Promise<MappedInvoice> {
    const row = await this.database.invoice.create({ data });
    return this.mapInvoice(row);
  }

  async findAll(options: FindAllInvoicesOptions): Promise<PaginatedInvoicesResult> {
    const { ability, projectId, status, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      AND: [
        this.abilityFilter(ability),
        ...(projectId ? [{ projectId }] : []),
        ...(status ? [{ status }] : []),
      ],
    };

    const [rows, total] = await this.database.$transaction([
      this.database.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.invoice.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.mapInvoice(r)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<MappedInvoice | null> {
    const where: Prisma.InvoiceWhereInput = {
      AND: [this.abilityFilter(ability), { id }],
    };
    const row = await this.database.invoice.findFirst({ where });
    return row ? this.mapInvoice(row) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.database.invoice.count({ where: { userId } });
  }

  async existsByUserIdAndNumber(
    userId: string,
    number: string,
    excludeId?: string,
  ): Promise<boolean> {
    const row = await this.database.invoice.findFirst({
      where: {
        userId,
        number,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!row;
  }

  async update(
    id: string,
    data: {
      number?: string;
      title?: string | null;
      amount?: Prisma.Decimal;
      currency?: string;
      status?: InvoiceStatus;
      projectId?: string | null;
      issuedAt?: Date | null;
      dueAt?: Date | null;
      notes?: string | null;
    },
  ): Promise<MappedInvoice> {
    const row = await this.database.invoice.update({ where: { id }, data });
    return this.mapInvoice(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.invoice.delete({ where: { id } });
  }

  private abilityFilter(ability: AppAbility): Prisma.InvoiceWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<string, Prisma.InvoiceWhereInput>;
    return filters['Invoice'] ?? {};
  }

  private mapInvoice(row: Invoice): MappedInvoice {
    return {
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      number: row.number,
      title: row.title,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      issuedAt: row.issuedAt,
      dueAt: row.dueAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
