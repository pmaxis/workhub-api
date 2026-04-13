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
  };
  return {
    Prisma: { Decimal, PrismaClientKnownRequestError },
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { ExpensesController } from '@/modules/expenses/controller/expenses.controller';
import { ExpensesService } from '@/modules/expenses/service/expenses.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Expense');
  can(Action.Read, 'Expense', { userId });
  can(Action.Update, 'Expense', { userId });
  can(Action.Delete, 'Expense', { userId });
  return build();
}

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockService }],
    }).compile();

    controller = module.get(ExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'e1' });
    const dto = { description: 'x', amount: 1, spentAt: '2026-01-01T00:00:00.000Z' };
    const res = await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
    expect(res).toEqual({ id: 'e1' });
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, expect.anything());
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'e1' });
    await controller.findOne('e1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('e1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'e1' });
    await controller.update('e1', { description: 'y' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('e1', ability, { description: 'y' });
  });

  it('delete delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.delete('e1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('e1', ability);
  });
});
