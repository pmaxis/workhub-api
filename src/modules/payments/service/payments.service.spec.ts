jest.mock('@/infrastructure/database/generated/client', () => {
  const PrismaClientKnownRequestError = class extends Error {
    code = '';
    constructor(message: string, opts?: { code?: string }) {
      super(message);
      this.code = opts?.code ?? '';
    }
  };
  const Decimal = class {
    constructor(public v: unknown) {}
    toFixed(n: number) {
      return Number(this.v).toFixed(n);
    }
  };
  return {
    Prisma: { Decimal, PrismaClientKnownRequestError },
  };
});

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { PaymentsRepository } from '@/modules/payments/repository/payments.repository';
import { PaymentsService } from '@/modules/payments/service/payments.service';

const userId = 'user-1';

const mappedPayment = {
  id: 'pay-1',
  userId,
  invoiceId: null as string | null,
  amount: { toFixed: (n: number) => Number(50).toFixed(n) },
  currency: 'USD',
  receivedAt: new Date('2026-01-15T12:00:00.000Z'),
  method: null as string | null,
  notes: null as string | null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPaymentsRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockInvoiceFindFirst = jest.fn();

const mockDatabase = {
  invoice: {
    findFirst: mockInvoiceFindFirst,
  },
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Payment');
  can(Action.Read, 'Payment', { userId: id });
  can(Action.Update, 'Payment', { userId: id });
  can(Action.Delete, 'Payment', { userId: id });
  return build();
}

function buildPaymentReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Payment', { userId: id });
  return build();
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockPaymentsRepo.create.mockResolvedValue(mappedPayment);
    mockPaymentsRepo.findOne.mockResolvedValue(mappedPayment);
    mockPaymentsRepo.findAll.mockResolvedValue({
      data: [mappedPayment],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockPaymentsRepo.update.mockResolvedValue(mappedPayment);
    mockInvoiceFindFirst.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepo },
        { provide: DatabaseService, useValue: mockDatabase },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create without invoice links payment', async () => {
    const dto = {
      amount: 50,
      receivedAt: '2026-01-15T12:00:00.000Z',
    };
    const res = await service.create(userId, dto);
    expect(mockInvoiceFindFirst).not.toHaveBeenCalled();
    expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId, invoiceId: null }),
    );
    expect(res.amount).toBe('50.00');
  });

  it('create resolves invoice when invoiceId provided', async () => {
    mockInvoiceFindFirst.mockResolvedValueOnce({ id: 'inv-1' });
    await service.create(userId, {
      amount: 10,
      invoiceId: 'inv-1',
      receivedAt: '2026-01-15T12:00:00.000Z',
    });
    expect(mockInvoiceFindFirst).toHaveBeenCalledWith({
      where: { id: 'inv-1', userId },
      select: { id: true },
    });
    expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'inv-1' }),
    );
  });

  it('create throws when invoice missing', async () => {
    mockInvoiceFindFirst.mockResolvedValueOnce(null);
    await expect(
      service.create(userId, {
        amount: 10,
        invoiceId: 'inv-x',
        receivedAt: '2026-01-15T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne throws when missing', async () => {
    mockPaymentsRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll maps data', async () => {
    const res = await service.findAll(ability, { page: 1, limit: 20 });
    expect(res.data).toHaveLength(1);
    expect(res.data[0].amount).toBe('50.00');
  });

  it('update returns existing when dto empty', async () => {
    const res = await service.update('pay-1', userId, ability, {});
    expect(mockPaymentsRepo.update).not.toHaveBeenCalled();
    expect(res.id).toBe(mappedPayment.id);
  });

  it('update throws when forbidden', async () => {
    const readOnly = buildPaymentReadOnlyAbility(userId);
    await expect(service.update('pay-1', userId, readOnly, { method: 'x' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delete throws when forbidden', async () => {
    const readOnly = buildPaymentReadOnlyAbility(userId);
    await expect(service.delete('pay-1', readOnly)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delete removes when allowed', async () => {
    await service.delete('pay-1', ability);
    expect(mockPaymentsRepo.delete).toHaveBeenCalledWith('pay-1');
  });
});
