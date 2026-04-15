import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Action, AppAbility } from '@/common/ability/ability.types';
import type { MappedReminder } from '@/modules/reminders/repository/reminders.repository';
import { RemindersRepository } from '@/modules/reminders/repository/reminders.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { PlanningService } from '@/modules/planning/service/planning.service';

const mockTasksRepository = {
  findByDueDateRange: jest.fn(),
  findOpenDeadlines: jest.fn(),
};

const mockRemindersRepository = {
  findActiveInRemindRange: jest.fn(),
};

function buildTaskReadAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  return build();
}

function buildReminderReadAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Reminder', { userId });
  return build();
}

function buildTaskAndReminderAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  can(Action.Read, 'Reminder', { userId });
  return build();
}

describe('PlanningService', () => {
  let service: PlanningService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        { provide: TasksRepository, useValue: mockTasksRepository },
        { provide: RemindersRepository, useValue: mockRemindersRepository },
      ],
    }).compile();

    service = module.get(PlanningService);
  });

  describe('getCalendar', () => {
    it('loads tasks and reminders when both reads are allowed', async () => {
      const ability = buildTaskAndReminderAbility('u1');
      const due = new Date('2026-04-05T12:00:00.000Z');
      mockTasksRepository.findByDueDateRange.mockResolvedValue([
        {
          id: 't1',
          title: 'A',
          description: null,
          status: TaskStatus.PENDING,
          dueAt: due,
          projectId: 'p1',
          projectOwnerId: 'u1',
          projectCompanyId: null,
          assigneeId: 'u1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const rem: MappedReminder = {
        id: 'r1',
        userId: 'u1',
        title: 'Bell',
        notes: null,
        remindAt: new Date('2026-04-05T09:00:00.000Z'),
        taskId: null,
        dismissedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRemindersRepository.findActiveInRemindRange.mockResolvedValue([rem]);

      const res = await service.getCalendar(ability, {
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30',
      });

      expect(mockTasksRepository.findByDueDateRange).toHaveBeenCalledWith(
        ability,
        '2026-04-01',
        '2026-04-30',
      );
      expect(mockRemindersRepository.findActiveInRemindRange).toHaveBeenCalledWith(
        ability,
        '2026-04-01',
        '2026-04-30',
      );
      expect(res.tasks).toHaveLength(1);
      expect(res.tasks[0]).toMatchObject({
        id: 't1',
        title: 'A',
        projectId: 'p1',
        status: TaskStatus.PENDING,
        dueAt: due,
      });
      expect(res.reminders).toEqual([
        { id: 'r1', title: 'Bell', remindAt: rem.remindAt, taskId: null },
      ]);
    });

    it('skips tasks when user cannot read Task', async () => {
      const ability = buildReminderReadAbility('u1');
      mockRemindersRepository.findActiveInRemindRange.mockResolvedValue([]);

      await service.getCalendar(ability, { from: '2026-04-01', to: '2026-04-02' });

      expect(mockTasksRepository.findByDueDateRange).not.toHaveBeenCalled();
      expect(mockRemindersRepository.findActiveInRemindRange).toHaveBeenCalled();
    });

    it('skips reminders when user cannot read Reminder', async () => {
      const ability = buildTaskReadAbility('u1');
      mockTasksRepository.findByDueDateRange.mockResolvedValue([]);

      await service.getCalendar(ability, { from: '2026-04-01', to: '2026-04-02' });

      expect(mockRemindersRepository.findActiveInRemindRange).not.toHaveBeenCalled();
      expect(mockTasksRepository.findByDueDateRange).toHaveBeenCalled();
    });

    it('omits tasks without dueAt from response', async () => {
      const ability = buildTaskReadAbility('u1');
      mockTasksRepository.findByDueDateRange.mockResolvedValue([
        {
          id: 't1',
          title: 'No due',
          description: null,
          status: TaskStatus.PENDING,
          dueAt: null,
          projectId: 'p1',
          projectOwnerId: 'u1',
          projectCompanyId: null,
          assigneeId: 'u1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await service.getCalendar(ability, { from: '2026-04-01', to: '2026-04-02' });
      expect(res.tasks).toHaveLength(0);
    });
  });

  describe('getDeadlines', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns empty when user cannot read Task', async () => {
      const ability = buildReminderReadAbility('u1');

      const res = await service.getDeadlines(ability, {});

      expect(res.tasks).toEqual([]);
      expect(mockTasksRepository.findOpenDeadlines).not.toHaveBeenCalled();
    });

    it('calls findOpenDeadlines with horizon end at end of UTC day', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-10T12:00:00.000Z'));

      const ability = buildTaskReadAbility('u1');
      mockTasksRepository.findOpenDeadlines.mockResolvedValue([]);

      await service.getDeadlines(ability, { horizonDays: 2, limit: 50 });

      expect(mockTasksRepository.findOpenDeadlines).toHaveBeenCalledWith(
        ability,
        new Date('2026-06-12T23:59:59.999Z'),
        50,
      );
    });

    it('defaults horizonDays and limit', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const ability = buildTaskReadAbility('u1');
      mockTasksRepository.findOpenDeadlines.mockResolvedValue([]);

      await service.getDeadlines(ability, {});

      expect(mockTasksRepository.findOpenDeadlines).toHaveBeenCalledWith(
        ability,
        new Date('2026-01-15T23:59:59.999Z'),
        100,
      );
    });
  });
});
