import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { RemindersController } from '@/modules/reminders/controller/reminders.controller';
import { RemindersService } from '@/modules/reminders/service/reminders.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Reminder');
  can(Action.Read, 'Reminder', { userId });
  can(Action.Update, 'Reminder', { userId });
  can(Action.Delete, 'Reminder', { userId });
  return build();
}

describe('RemindersController', () => {
  let controller: RemindersController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [{ provide: RemindersService, useValue: mockService }],
    }).compile();

    controller = module.get(RemindersController);
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'r1' });
    const dto = { title: 'x', remindAt: '2026-04-10T10:00:00.000Z' };
    await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 50 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, {});
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'r1' });
    await controller.findOne('r1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('r1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'r1' });
    await controller.update('r1', { title: 'z' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('r1', ability, { title: 'z' });
  });

  it('remove delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.remove('r1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('r1', ability);
  });
});
