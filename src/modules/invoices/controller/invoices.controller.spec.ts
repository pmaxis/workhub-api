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
import { InvoicesController } from '@/modules/invoices/controller/invoices.controller';
import { InvoicesService } from '@/modules/invoices/service/invoices.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Invoice');
  can(Action.Read, 'Invoice', { userId });
  can(Action.Update, 'Invoice', { userId });
  can(Action.Delete, 'Invoice', { userId });
  return build();
}

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [{ provide: InvoicesService, useValue: mockService }],
    }).compile();

    controller = module.get(InvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    mockService.create.mockResolvedValue({ id: 'i1' });
    const res = await controller.create({ amount: 10 }, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', expect.anything(), { amount: 10 });
    expect(res).toEqual({ id: 'i1' });
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, expect.anything());
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'i1' });
    const res = await controller.findOne('i1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('i1', ability);
    expect(res).toEqual({ id: 'i1' });
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'i1' });
    await controller.update('i1', { title: 'x' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('i1', ability, { title: 'x' });
  });

  it('delete delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.delete('i1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('i1', ability);
  });
});
