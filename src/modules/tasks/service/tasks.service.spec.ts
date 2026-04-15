import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { NotificationsRepository } from '@/modules/notifications/repository/notifications.repository';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

const ownerId = 'user-1';
const projectId = 'proj-1';
const taskId = 'task-1';

const baseDates = {
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockTasksRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  sumTrackedDurationSecondsForUser: jest.fn(),
};

const mockProjectsRepository = {
  findOne: jest.fn(),
};

const mockNotificationsRepository = {
  create: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  can(Action.Create, 'Task');
  can(Action.Update, 'Task', { projectOwnerId: userId });
  can(Action.Delete, 'Task', { projectOwnerId: userId });
  return build();
}

function buildReadOnlyTaskAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  return build();
}

describe('TasksService', () => {
  let service: TasksService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(ownerId);
    mockTasksRepository.sumTrackedDurationSecondsForUser.mockResolvedValue(new Map());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockTasksRepository },
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
        { provide: NotificationsRepository, useValue: mockNotificationsRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateTaskDto = {
      title: 'Task',
      projectId,
    };

    it('should create task when project exists', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({
        id: projectId,
        ownerId,
        companyId: null,
      });
      const row = {
        id: taskId,
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        dueAt: null as Date | null,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.create.mockResolvedValue(row);

      const result = await service.create(ownerId, ability, dto);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ability);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null,
        assigneeId: ownerId,
      });
      expect(result).toBeInstanceOf(TaskResponseDto);
      expect(result).toMatchObject({
        id: taskId,
        title: dto.title,
        projectId,
        assigneeId: ownerId,
        status: TaskStatus.PENDING,
      });
      expect(mockNotificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: ownerId,
          type: 'SYSTEM',
          title: 'Task created',
        }),
      );
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(ownerId, ability, dto)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.create).not.toHaveBeenCalled();
    });

    it('should pass dueAt to repository when provided', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({
        id: projectId,
        ownerId,
        companyId: null,
      });
      const due = new Date('2026-05-01T12:00:00.000Z');
      const row = {
        id: taskId,
        title: 'With due',
        description: null,
        status: TaskStatus.PENDING,
        dueAt: due,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.create.mockResolvedValue(row);

      await service.create(ownerId, ability, {
        title: 'With due',
        projectId,
        dueAt: '2026-05-01T12:00:00.000Z',
      });

      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        title: 'With due',
        description: null,
        status: TaskStatus.PENDING,
        dueAt: new Date('2026-05-01T12:00:00.000Z'),
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null,
        assigneeId: ownerId,
      });
    });
  });

  describe('findAll', () => {
    it('should return tasks for ability scope', async () => {
      const row = {
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        dueAt: null as Date | null,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findAll.mockResolvedValue([row]);

      const result = await service.findAll(ownerId, ability);

      expect(mockProjectsRepository.findOne).not.toHaveBeenCalled();
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith({
        ability,
        projectId: undefined,
        dueFrom: undefined,
        dueTo: undefined,
      });
      expect(mockTasksRepository.sumTrackedDurationSecondsForUser).toHaveBeenCalledWith(ownerId, [
        taskId,
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: taskId, trackedDurationSeconds: 0 });
    });

    it('should validate project when projectId filter is set', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ id: projectId });
      mockTasksRepository.findAll.mockResolvedValue([]);

      await service.findAll(ownerId, ability, projectId);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ability);
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith({
        ability,
        projectId,
        dueFrom: undefined,
        dueTo: undefined,
      });
    });

    it('should pass dueFrom and dueTo to repository', async () => {
      mockTasksRepository.findAll.mockResolvedValue([]);

      await service.findAll(ownerId, ability, undefined, '2026-04-01', '2026-04-30');

      expect(mockTasksRepository.findAll).toHaveBeenCalledWith({
        ability,
        projectId: undefined,
        dueFrom: '2026-04-01',
        dueTo: '2026-04-30',
      });
    });

    it('should throw when filtered project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(ownerId, ability, projectId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return task when found', async () => {
      const row = {
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.COMPLETED,
        dueAt: null as Date | null,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findOne.mockResolvedValue(row);

      const result = await service.findOne(taskId, ownerId, ability);

      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(taskId, ability);
      expect(mockTasksRepository.sumTrackedDurationSecondsForUser).toHaveBeenCalledWith(ownerId, [
        taskId,
      ]);
      expect(result).toMatchObject({ id: taskId, status: TaskStatus.COMPLETED });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, ownerId, ability)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = {
      id: taskId,
      title: 'Old',
      description: 'd',
      status: TaskStatus.PENDING,
      dueAt: null as Date | null,
      projectId,
      projectOwnerId: ownerId,
      projectCompanyId: null as string | null,
      assigneeId: ownerId,
      ...baseDates,
    };

    it('should return current task when dto has no fields to apply', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });

      const result = await service.update(taskId, ownerId, ability, {} as UpdateTaskDto);

      expect(mockTasksRepository.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: taskId, title: 'Old' });
    });

    it('should update when dto has changes', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });
      const updated = {
        id: taskId,
        title: 'New',
        description: 'd',
        status: TaskStatus.PENDING,
        dueAt: null as Date | null,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        createdAt: existing.createdAt,
        updatedAt: new Date('2026-01-03'),
      };
      mockTasksRepository.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { title: 'New' };
      const result = await service.update(taskId, ownerId, ability, dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, { title: 'New' });
      expect(result).toMatchObject({ title: 'New' });
      expect(mockNotificationsRepository.create).not.toHaveBeenCalled();
    });

    it('should map dueAt string to Date on update', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });
      const due = new Date('2026-06-01T12:00:00.000Z');
      const updated = {
        ...existing,
        dueAt: due,
        updatedAt: new Date('2026-01-03'),
      };
      mockTasksRepository.update.mockResolvedValue(updated);

      await service.update(taskId, ownerId, ability, {
        dueAt: '2026-06-01T12:00:00.000Z',
      });

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, {
        dueAt: new Date('2026-06-01T12:00:00.000Z'),
      });
    });

    it('should clear dueAt when dto.dueAt is null', async () => {
      mockTasksRepository.findOne.mockResolvedValue({
        ...existing,
        dueAt: new Date('2026-05-01T00:00:00.000Z'),
      });
      const updated = {
        ...existing,
        dueAt: null as Date | null,
        updatedAt: new Date('2026-01-03'),
      };
      mockTasksRepository.update.mockResolvedValue(updated);

      await service.update(taskId, ownerId, ability, { dueAt: null });

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, { dueAt: null });
    });

    it('should create notification when status changes', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });
      const updated = {
        ...existing,
        status: TaskStatus.IN_PROGRESS,
        updatedAt: new Date('2026-01-03'),
      };
      mockTasksRepository.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { status: TaskStatus.IN_PROGRESS };
      await service.update(taskId, ownerId, ability, dto);

      expect(mockNotificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: ownerId,
          type: 'SYSTEM',
          title: 'Task status changed',
        }),
      );
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.update(taskId, ownerId, ability, { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTasksRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user cannot update', async () => {
      const readOnly = buildReadOnlyTaskAbility(ownerId);
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });

      await expect(service.update(taskId, ownerId, readOnly, { title: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockTasksRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const existing = {
      id: taskId,
      title: 'T',
      description: null,
      status: TaskStatus.PENDING,
      dueAt: null as Date | null,
      projectId,
      projectOwnerId: ownerId,
      projectCompanyId: null as string | null,
      assigneeId: ownerId,
      ...baseDates,
    };

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(taskId, ability)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete when task exists', async () => {
      mockTasksRepository.findOne.mockResolvedValue(existing);
      mockTasksRepository.delete.mockResolvedValue(undefined);

      await service.delete(taskId, ability);

      expect(mockTasksRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw ForbiddenException when user cannot delete', async () => {
      const readOnly = buildReadOnlyTaskAbility(ownerId);
      mockTasksRepository.findOne.mockResolvedValue(existing);

      await expect(service.delete(taskId, readOnly)).rejects.toThrow(ForbiddenException);
      expect(mockTasksRepository.delete).not.toHaveBeenCalled();
    });
  });
});
