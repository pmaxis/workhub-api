import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { TimeEntriesController } from '@/modules/time-entries/controller/time-entries.controller';
import { TimeEntriesService } from '@/modules/time-entries/service/time-entries.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findRunning: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'TimeEntry');
  can(Action.Read, 'TimeEntry', { userId });
  can(Action.Update, 'TimeEntry', { userId });
  can(Action.Delete, 'TimeEntry', { userId });
  return build();
}

describe('TimeEntriesController', () => {
  let controller: TimeEntriesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeEntriesController],
      providers: [{ provide: TimeEntriesService, useValue: mockService }],
    }).compile();

    controller = module.get(TimeEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    mockService.create.mockResolvedValue({ id: 'te1' });
    const res = await controller.create({ startedAt: '2026-01-01T10:00:00.000Z' }, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', expect.anything(), expect.anything());
    expect(res).toEqual({ id: 'te1' });
  });

  it('findRunning delegates', async () => {
    mockService.findRunning.mockResolvedValue(null);
    const res = await controller.findRunning(ability);
    expect(mockService.findRunning).toHaveBeenCalled();
    expect(res).toBeNull();
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'te1' });
    await controller.update('te1', { description: 'x' }, 'u1', ability);
    expect(mockService.update).toHaveBeenCalledWith('te1', 'u1', expect.anything(), {
      description: 'x',
    });
  });

  it('delete delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.delete('te1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('te1', expect.anything());
  });
});
