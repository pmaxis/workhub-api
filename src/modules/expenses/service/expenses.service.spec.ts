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
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { ExpensesRepository } from '@/modules/expenses/repository/expenses.repository';
import { ExpensesService } from '@/modules/expenses/service/expenses.service';

const userId = 'user-1';

const mappedExpense = {
  id: 'ex-1',
  userId,
  projectId: null as string | null,
  description: 'Hosting',
  category: 'infra' as string | null,
  amount: { toFixed: (n: number) => Number(29.99).toFixed(n) },
  currency: 'USD',
  spentAt: new Date('2026-02-01'),
  notes: null as string | null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockExpensesRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockProjectsRepo = {
  findOne: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Expense');
  can(Action.Read, 'Expense', { userId: id });
  can(Action.Update, 'Expense', { userId: id });
  can(Action.Delete, 'Expense', { userId: id });
  return build();
}

function buildExpenseReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Expense', { userId: id });
  return build();
}

describe('ExpensesService', () => {
  let service: ExpensesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockExpensesRepo.create.mockResolvedValue(mappedExpense);
    mockExpensesRepo.findOne.mockResolvedValue(mappedExpense);
    mockExpensesRepo.findAll.mockResolvedValue({
      data: [mappedExpense],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockExpensesRepo.update.mockResolvedValue(mappedExpense);
    mockProjectsRepo.findOne.mockResolvedValue({ id: 'p-1', name: 'Proj' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: ExpensesRepository, useValue: mockExpensesRepo },
        { provide: ProjectsRepository, useValue: mockProjectsRepo },
      ],
    }).compile();

    service = module.get(ExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create persists expense', async () => {
    const res = await service.create(userId, ability, {
      description: 'Hosting',
      amount: 29.99,
      spentAt: '2026-02-01T00:00:00.000Z',
    });
    expect(mockExpensesRepo.create).toHaveBeenCalled();
    expect(res.amount).toBe('29.99');
  });

  it('create throws when project not found', async () => {
    mockProjectsRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create(userId, ability, {
        description: 'x',
        amount: 1,
        spentAt: '2026-02-01T00:00:00.000Z',
        projectId: 'missing',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne throws when missing', async () => {
    mockExpensesRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll maps data', async () => {
    const res = await service.findAll(ability, {});
    expect(res.data[0].description).toBe('Hosting');
  });

  it('update returns existing when dto empty', async () => {
    const res = await service.update('ex-1', ability, {});
    expect(mockExpensesRepo.update).not.toHaveBeenCalled();
    expect(res.id).toBe(mappedExpense.id);
  });

  it('update throws when forbidden', async () => {
    const readOnly = buildExpenseReadOnlyAbility(userId);
    await expect(service.update('ex-1', readOnly, { description: 'n' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delete removes when allowed', async () => {
    await service.delete('ex-1', ability);
    expect(mockExpensesRepo.delete).toHaveBeenCalledWith('ex-1');
  });
});
