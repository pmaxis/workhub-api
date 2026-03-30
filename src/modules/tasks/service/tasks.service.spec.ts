import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
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

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();
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
      mockProjectsRepository.findOne.mockResolvedValue({ id: projectId });
      const row = {
        id: taskId,
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.create.mockResolvedValue(row);

      const result = await service.create(ownerId, dto);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ownerId);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        projectId,
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

      await expect(service.create(ownerId, dto)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return tasks for owner', async () => {
      const row = {
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findAll.mockResolvedValue([row]);

      const result = await service.findAll(ownerId);

      expect(mockProjectsRepository.findOne).not.toHaveBeenCalled();
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(ownerId, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: taskId });
    });

    it('should validate project when projectId filter is set', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ id: projectId });
      mockTasksRepository.findAll.mockResolvedValue([]);

      await service.findAll(ownerId, projectId);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ownerId);
      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(ownerId, projectId);
    });

    it('should throw when filtered project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(ownerId, projectId)).rejects.toThrow(NotFoundException);
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
        assigneeId: ownerId,
        ...baseDates,
      };
      mockTasksRepository.findOne.mockResolvedValue(row);

      const result = await service.findOne(ownerId, taskId);

      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(taskId, ownerId);
      expect(result).toMatchObject({ id: taskId, status: TaskStatus.COMPLETED });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(ownerId, taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = {
      id: taskId,
      title: 'Old',
      description: 'd',
      status: TaskStatus.PENDING,
      projectId,
      assigneeId: ownerId,
      ...baseDates,
    };

    it('should return current task when dto has no fields to apply', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });

      const result = await service.update(ownerId, taskId, {} as UpdateTaskDto);

      expect(mockTasksRepository.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: taskId, title: 'Old' });
    });

    it('should update when dto has changes', async () => {
      mockTasksRepository.findOne.mockResolvedValue({ ...existing });
      const updated = { ...existing, title: 'New', updatedAt: new Date('2026-01-03') };
      mockTasksRepository.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { title: 'New' };
      const result = await service.update(ownerId, taskId, dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, { title: 'New' });
      expect(result).toMatchObject({ title: 'New' });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.update(ownerId, taskId, { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTasksRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should throw when task not found', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(ownerId, taskId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete when task exists', async () => {
      mockTasksRepository.findOne.mockResolvedValue({
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: ownerId,
        ...baseDates,
      });
      mockTasksRepository.delete.mockResolvedValue(undefined);

      await service.delete(ownerId, taskId);

      expect(mockTasksRepository.delete).toHaveBeenCalledWith(taskId);
    });
  });
});
