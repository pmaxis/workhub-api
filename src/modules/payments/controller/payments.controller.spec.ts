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
import { PaymentsController } from '@/modules/payments/controller/payments.controller';
import { PaymentsService } from '@/modules/payments/service/payments.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Payment');
  can(Action.Read, 'Payment', { userId });
  can(Action.Update, 'Payment', { userId });
  can(Action.Delete, 'Payment', { userId });
  return build();
}

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockService }],
    }).compile();

    controller = module.get(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'p1' });
    const dto = { amount: 1, receivedAt: '2026-01-01T00:00:00.000Z' };
    const res = await controller.create(dto, 'u1');
    expect(mockService.create).toHaveBeenCalledWith('u1', dto);
    expect(res).toEqual({ id: 'p1' });
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, expect.anything());
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'p1' });
    await controller.findOne('p1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('p1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'p1' });
    await controller.update('p1', { method: 'wire' }, 'u1', ability);
    expect(mockService.update).toHaveBeenCalledWith('p1', 'u1', ability, { method: 'wire' });
  });

  it('delete delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.delete('p1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('p1', ability);
  });
});
