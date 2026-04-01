import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

/** Same as authenticated user; matches `Project.ownerId` for repository scoping. */
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
};

const mockProjectsRepository = {
  findOne: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockTasksRepository },
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
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
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(ownerId, ability, dto)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return tasks for ability scope', async () => {
      const row = {
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findAll.mockResolvedValue([row]);

      const result = await service.findAll(ability);

      expect(mockProjectsRepository.findOne).not.toHaveBeenCalled();
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith({ ability, projectId: undefined });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: taskId });
    });

    it('should validate project when projectId filter is set', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ id: projectId });
      mockTasksRepository.findAll.mockResolvedValue([]);

      await service.findAll(ability, projectId);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ability);
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith({ ability, projectId });
    });

    it('should throw when filtered project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(ability, projectId)).rejects.toThrow(NotFoundException);
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
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findOne.mockResolvedValue(row);

      const result = await service.findOne(taskId, ability);

      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(taskId, ability);
      expect(result).toMatchObject({ id: taskId, status: TaskStatus.COMPLETED });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, ability)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = {
      id: taskId,
      title: 'Old',
      description: 'd',
      status: TaskStatus.PENDING,
      projectId,
      projectOwnerId: ownerId,
      projectCompanyId: null as string | null,
      assigneeId: ownerId,
      ...baseDates,
    };

    it('should return current task when dto has no fields to apply', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });

      const result = await service.update(taskId, ability, {} as UpdateTaskDto);

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
        projectId,
        projectOwnerId: ownerId,
        projectCompanyId: null as string | null,
        assigneeId: ownerId,
        createdAt: existing.createdAt,
        updatedAt: new Date('2026-01-03'),
      };
      mockTasksRepository.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { title: 'New' };
      const result = await service.update(taskId, ability, dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, { title: 'New' });
      expect(result).toMatchObject({ title: 'New' });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.update(taskId, ability, { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTasksRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user cannot update', async () => {
      const readOnly = buildReadOnlyTaskAbility(ownerId);
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });

      await expect(service.update(taskId, readOnly, { title: 'x' })).rejects.toThrow(
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
