jest.mock('@/infrastructure/database/generated/client', () => {
  class Decimal {
    constructor(public v: number) {}
    toFixed(n: number) {
      return this.v.toFixed(n);
    }
    minus(o: Decimal) {
      return new Decimal(this.v - o.v);
    }
  }
  return { Prisma: { Decimal } };
});

import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@/infrastructure/database/generated/client';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { FinanceAnalyticsService } from '@/modules/finance-analytics/service/finance-analytics.service';

const userId = 'u-1';

/** Mirrors the argument passed to `prisma.invoice.groupBy` in FinanceAnalyticsService. */
type InvoiceGroupByArgs = {
  by: string[];
  where: {
    userId: string;
    createdAt?: { gte?: Date; lte?: Date };
  };
  orderBy: { status: string };
  _sum: { amount: boolean };
  _count: { _all: boolean };
};

describe('FinanceAnalyticsService', () => {
  let service: FinanceAnalyticsService;

  const mockGroupBy: jest.MockedFunction<(args: InvoiceGroupByArgs) => Promise<unknown>> =
    jest.fn();
  const mockPayAggregate = jest.fn();
  const mockExpAggregate = jest.fn();

  const mockDatabase = {
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    invoice: { groupBy: mockGroupBy },
    payment: { aggregate: mockPayAggregate },
    expense: { aggregate: mockExpAggregate },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGroupBy.mockResolvedValue([
      {
        status: InvoiceStatus.DRAFT,
        _sum: { amount: new Prisma.Decimal(100) },
        _count: { _all: 3 },
      },
    ]);
    mockPayAggregate.mockResolvedValue({
      _sum: { amount: new Prisma.Decimal(250) },
    });
    mockExpAggregate.mockResolvedValue({
      _sum: { amount: new Prisma.Decimal(75) },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceAnalyticsService, { provide: DatabaseService, useValue: mockDatabase }],
    }).compile();

    service = module.get(FinanceAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getSummary aggregates invoices, payments, and expenses', async () => {
    const res = await service.getSummary(userId, {});
    expect(mockDatabase.$transaction).toHaveBeenCalled();
    expect(res.paymentsTotal).toBe('250.00');
    expect(res.expensesTotal).toBe('75.00');
    expect(res.netCashflow).toBe('175.00');
    const draft = res.invoicesByStatus.find((r) => r.status === InvoiceStatus.DRAFT);
    expect(draft?.count).toBe(3);
    expect(draft?.totalAmount).toBe('100.00');
  });

  it('getSummary passes date range into queries', async () => {
    await service.getSummary(userId, {
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T00:00:00.000Z',
    });
    expect(mockGroupBy).toHaveBeenCalled();
    const payload = mockGroupBy.mock.calls[0]?.[0];
    expect(payload).toBeDefined();
    expect(payload?.where.userId).toBe(userId);
    expect(payload?.where.createdAt?.gte).toBeInstanceOf(Date);
    expect(payload?.where.createdAt?.lte).toBeInstanceOf(Date);
  });
});
