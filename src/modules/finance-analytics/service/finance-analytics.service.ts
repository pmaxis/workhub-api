import { Injectable } from '@nestjs/common';
import { Prisma } from '@/infrastructure/database/generated/client';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';
import {
  FinanceSummaryResponseDto,
  InvoiceStatusBreakdownDto,
} from '@/modules/finance-analytics/dto/finance-summary-response.dto';

@Injectable()
export class FinanceAnalyticsService {
  constructor(private readonly database: DatabaseService) {}

  async getSummary(
    userId: string,
    query: { from?: string; to?: string },
  ): Promise<FinanceSummaryResponseDto> {
    const invoiceWhere = { userId, ...this.dateRangeFilter('createdAt', query.from, query.to) };
    const paymentWhere = { userId, ...this.dateRangeFilter('receivedAt', query.from, query.to) };
    const expenseWhere = { userId, ...this.dateRangeFilter('spentAt', query.from, query.to) };

    const [invoiceGroups, payAgg, expAgg] = await this.database.$transaction([
      this.database.invoice.groupBy({
        by: ['status'],
        where: invoiceWhere,
        orderBy: { status: 'asc' },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.database.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
      }),
      this.database.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
      }),
    ]);

    const statuses = Object.values(InvoiceStatus);
    const byStatus = new Map(
      invoiceGroups.map((g) => {
        const count =
          g._count && typeof g._count === 'object' && '_all' in g._count ? g._count._all : 0;
        return [
          g.status,
          {
            count,
            total: g._sum?.amount,
          },
        ];
      }),
    );

    const invoicesByStatus: InvoiceStatusBreakdownDto[] = statuses.map((status) => {
      const row = byStatus.get(status);
      const sum = row?.total;
      return {
        status,
        count: row?.count ?? 0,
        totalAmount: sum ? sum.toFixed(2) : '0.00',
      };
    });

    const paySum = payAgg._sum.amount ?? new Prisma.Decimal(0);
    const expSum = expAgg._sum.amount ?? new Prisma.Decimal(0);

    return {
      invoicesByStatus,
      paymentsTotal: paySum.toFixed(2),
      expensesTotal: expSum.toFixed(2),
      netCashflow: paySum.minus(expSum).toFixed(2),
    };
  }

  private dateRangeFilter(
    field: 'createdAt' | 'receivedAt' | 'spentAt',
    from?: string,
    to?: string,
  ): Record<string, { gte?: Date; lte?: Date }> {
    if (!from && !to) {
      return {};
    }
    const range: { gte?: Date; lte?: Date } = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
    return { [field]: range };
  }
}
