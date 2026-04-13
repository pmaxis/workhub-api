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
import { FinanceAnalyticsController } from '@/modules/finance-analytics/controller/finance-analytics.controller';
import { FinanceAnalyticsService } from '@/modules/finance-analytics/service/finance-analytics.service';

const mockService = {
  getSummary: jest.fn(),
};

describe('FinanceAnalyticsController', () => {
  let controller: FinanceAnalyticsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceAnalyticsController],
      providers: [{ provide: FinanceAnalyticsService, useValue: mockService }],
    }).compile();

    controller = module.get(FinanceAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSummary delegates to service', async () => {
    const summary = {
      invoicesByStatus: [],
      paymentsTotal: '0.00',
      expensesTotal: '0.00',
      netCashflow: '0.00',
    };
    mockService.getSummary.mockResolvedValue(summary);
    const res = await controller.getSummary({ from: '2026-01-01' }, 'user-1');
    expect(mockService.getSummary).toHaveBeenCalledWith('user-1', { from: '2026-01-01' });
    expect(res).toEqual(summary);
  });
});
