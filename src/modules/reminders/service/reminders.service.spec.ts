import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import type { MappedReminder } from '@/modules/reminders/repository/reminders.repository';
import { RemindersRepository } from '@/modules/reminders/repository/reminders.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { RemindersService } from '@/modules/reminders/service/reminders.service';

const userId = 'user-1';

const baseReminder: MappedReminder = {
  id: 'r-1',
  userId,
  title: 'Call client',
  notes: null,
  remindAt: new Date('2026-04-10T10:00:00.000Z'),
  taskId: null,
  dismissedAt: null,
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-01'),
};

const mockRemindersRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTasksRepo = {
  findOne: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Reminder');
  can(Action.Read, 'Reminder', { userId: id });
  can(Action.Update, 'Reminder', { userId: id });
  can(Action.Delete, 'Reminder', { userId: id });
  return build();
}

function buildReadOnlyReminderAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Reminder', { userId: id });
  return build();
}

describe('RemindersService', () => {
  let service: RemindersService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockRemindersRepo.create.mockResolvedValue(baseReminder);
    mockRemindersRepo.findOne.mockResolvedValue(baseReminder);
    mockRemindersRepo.findAll.mockResolvedValue({
      data: [baseReminder],
      total: 1,
      page: 1,
      limit: 50,
    });
    mockRemindersRepo.update.mockResolvedValue(baseReminder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: RemindersRepository, useValue: mockRemindersRepo },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get(RemindersService);
  });

  describe('create', () => {
    it('creates without task link', async () => {
      await service.create(userId, ability, {
        title: '  Rem  ',
        remindAt: '2026-04-10T10:00:00.000Z',
      });
      expect(mockTasksRepo.findOne).not.toHaveBeenCalled();
      expect(mockRemindersRepo.create).toHaveBeenCalledWith({
        userId,
        title: 'Rem',
        notes: null,
        remindAt: new Date('2026-04-10T10:00:00.000Z'),
        taskId: null,
      });
    });

    it('resolves taskId when task is visible', async () => {
      mockTasksRepo.findOne.mockResolvedValue({
        id: 't-1',
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        dueAt: null,
        projectId: 'p1',
        projectOwnerId: userId,
        projectCompanyId: null,
        assigneeId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(userId, ability, {
        title: 'X',
        remindAt: '2026-04-10T10:00:00.000Z',
        taskId: 't-1',
      });

      expect(mockTasksRepo.findOne).toHaveBeenCalledWith('t-1', ability);
      expect(mockRemindersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: 't-1' }),
      );
    });

    it('throws when linked task is not found', async () => {
      mockTasksRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(userId, ability, {
          title: 'X',
          remindAt: '2026-04-10T10:00:00.000Z',
          taskId: 'missing',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRemindersRepo.create).not.toHaveBeenCalled();
    });
  });

  it('findAll passes includeDismissed only when true', async () => {
    await service.findAll(ability, { page: 2, limit: 10 });
    expect(mockRemindersRepo.findAll).toHaveBeenCalledWith({
      ability,
      includeDismissed: false,
      page: 2,
      limit: 10,
    });

    await service.findAll(ability, { includeDismissed: true });
    expect(mockRemindersRepo.findAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ includeDismissed: true }),
    );
  });

  it('findOne throws when missing', async () => {
    mockRemindersRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('update', () => {
    it('returns existing when dto is empty', async () => {
      await service.update('r-1', ability, {});
      expect(mockRemindersRepo.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when cannot update', async () => {
      const readOnly = buildReadOnlyReminderAbility(userId);
      await expect(service.update('r-1', readOnly, { title: 'Y' })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(mockRemindersRepo.update).not.toHaveBeenCalled();
    });

    it('clears taskId when dto.taskId is null', async () => {
      const withTask: MappedReminder = { ...baseReminder, taskId: 't-1' };
      mockRemindersRepo.findOne.mockResolvedValue(withTask);
      mockRemindersRepo.update.mockResolvedValue({ ...withTask, taskId: null });

      await service.update('r-1', ability, { taskId: null });

      expect(mockRemindersRepo.update).toHaveBeenCalledWith('r-1', { taskId: null });
    });
  });

  describe('delete', () => {
    it('throws when reminder not found', async () => {
      mockRemindersRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.delete('r-1', ability)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRemindersRepo.delete).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when cannot delete', async () => {
      const readOnly = buildReadOnlyReminderAbility(userId);
      await expect(service.delete('r-1', readOnly)).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRemindersRepo.delete).not.toHaveBeenCalled();
    });

    it('deletes when allowed', async () => {
      mockRemindersRepo.delete.mockResolvedValue(undefined);
      await service.delete('r-1', ability);
      expect(mockRemindersRepo.delete).toHaveBeenCalledWith('r-1');
    });
  });
});
