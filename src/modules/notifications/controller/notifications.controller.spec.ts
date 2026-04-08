import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { NotificationsController } from '@/modules/notifications/controller/notifications.controller';
import { NotificationsService } from '@/modules/notifications/service/notifications.service';
import { NotificationType } from '@/infrastructure/database/generated/enums';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  unreadCount: jest.fn(),
  markAllRead: jest.fn(),
  markRead: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Notification', { userId });
  can(Action.Update, 'Notification', { userId });
  can(Action.Create, 'Notification');
  return build();
}

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    mockService.create.mockResolvedValue({ id: 'n1' });
    const res = await controller.create({
      userId: 'u1',
      type: NotificationType.SYSTEM,
      title: 't',
      body: 'b',
      data: null,
    });
    expect(mockService.create).toHaveBeenCalled();
    expect(res).toEqual({ id: 'n1' });
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    const res = await controller.findAll({ page: 1, limit: 20 }, 'u1', ability);
    expect(mockService.findAll).toHaveBeenCalled();
    expect(res).toEqual({ data: [], total: 0, page: 1, limit: 20 });
  });

  it('unreadCount wraps response', async () => {
    mockService.unreadCount.mockResolvedValue(2);
    const res = await controller.unreadCount('u1', ability);
    expect(res).toEqual({ unreadCount: 2 });
  });

  it('markAllRead delegates', async () => {
    mockService.markAllRead.mockResolvedValue({ updated: 1 });
    const res = await controller.markAllRead('u1', ability);
    expect(res).toEqual({ updated: 1 });
  });

  it('markRead delegates', async () => {
    mockService.markRead.mockResolvedValue(undefined);
    await controller.markRead('n1', ability);
    expect(mockService.markRead).toHaveBeenCalledWith('n1', expect.anything());
  });
});
