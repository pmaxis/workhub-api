import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { NotificationType } from '@/infrastructure/database/generated/enums';
import { NotificationsRepository } from '@/modules/notifications/repository/notifications.repository';
import { NotificationsService } from '@/modules/notifications/service/notifications.service';

const userId = 'user-1';

const baseNotification = {
  id: 'n-1',
  userId,
  type: NotificationType.SYSTEM,
  title: 'Hello',
  body: 'World',
  data: null,
  isRead: false,
  readAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
  unreadCount: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Notification', { userId: id });
  can(Action.Update, 'Notification', { userId: id });
  can(Action.Create, 'Notification');
  return build();
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: NotificationsRepository, useValue: mockRepo }],
    }).compile();

    service = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should persist notification', async () => {
    mockRepo.create.mockResolvedValue(baseNotification);

    const res = await service.create({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Hello',
      body: 'World',
      data: { a: 1 },
    });

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        type: NotificationType.SYSTEM,
        title: 'Hello',
        body: 'World',
      }),
    );
    expect(res).toMatchObject({ id: 'n-1', userId, title: 'Hello' });
  });

  it('findAll should map paginated data', async () => {
    mockRepo.findAll.mockResolvedValue({ data: [baseNotification], total: 1, page: 1, limit: 20 });

    const res = await service.findAll(ability, userId, { page: 1, limit: 20 });

    expect(res.total).toBe(1);
    expect(res.data[0]).toMatchObject({ id: 'n-1', userId });
  });

  it('markRead should throw NotFoundException when missing', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.markRead('missing', ability)).rejects.toThrow(NotFoundException);
  });

  it('markRead should throw ForbiddenException when forbidden', async () => {
    const otherAbility = buildAbility('someone-else');
    mockRepo.findOne.mockResolvedValue(baseNotification);
    await expect(service.markRead('n-1', otherAbility)).rejects.toThrow(ForbiddenException);
  });

  it('markRead should update when unread', async () => {
    mockRepo.findOne.mockResolvedValue(baseNotification);
    mockRepo.markRead.mockResolvedValue(undefined);

    await service.markRead('n-1', ability);

    expect(mockRepo.markRead).toHaveBeenCalledWith('n-1');
  });

  it('markAllRead returns updated count', async () => {
    mockRepo.markAllRead.mockResolvedValue(3);

    const res = await service.markAllRead(ability, userId);

    expect(res).toEqual({ updated: 3 });
  });

  it('unreadCount returns number', async () => {
    mockRepo.unreadCount.mockResolvedValue(5);
    await expect(service.unreadCount(ability, userId)).resolves.toBe(5);
  });
});
