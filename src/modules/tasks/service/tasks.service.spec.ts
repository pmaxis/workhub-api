import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';

const userId = 'user-1';
const projectId = 'proj-1';
const taskId = 'task-1';

const baseDates = {
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockTasksRepository = {
  create: jest.fn(),
  findManyByProjectOwner: jest.fn(),
  findByIdForProjectOwner: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockProjectsRepository = {
  findByIdForOwner: jest.fn(),
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

    it('should create task when project exists and assignee is self', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({ id: projectId });
      const row = {
        id: taskId,
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: userId,
        ...baseDates,
      };
      mockTasksRepository.create.mockResolvedValue(row);

      const result = await service.create(userId, dto);

      expect(mockProjectsRepository.findByIdForOwner).toHaveBeenCalledWith(projectId, userId);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: userId,
      });
      expect(result).toMatchObject({
        id: taskId,
        title: dto.title,
        projectId,
        assigneeId: userId,
        status: TaskStatus.PENDING,
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when assignee is not current user', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({ id: projectId });

      await expect(service.create(userId, { ...dto, assigneeId: 'other-user' })).rejects.toThrow(
        BadRequestException,
      );
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
        assigneeId: userId,
        ...baseDates,
      };
      mockTasksRepository.findManyByProjectOwner.mockResolvedValue([row]);

      const result = await service.findAll(userId);

      expect(mockProjectsRepository.findByIdForOwner).not.toHaveBeenCalled();
      expect(mockTasksRepository.findManyByProjectOwner).toHaveBeenCalledWith(userId, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: taskId });
    });

    it('should validate project when projectId filter is set', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({ id: projectId });
      mockTasksRepository.findManyByProjectOwner.mockResolvedValue([]);

      await service.findAll(userId, projectId);

      expect(mockProjectsRepository.findByIdForOwner).toHaveBeenCalledWith(projectId, userId);
      expect(mockTasksRepository.findManyByProjectOwner).toHaveBeenCalledWith(userId, projectId);
    });

    it('should throw when filtered project not found', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(null);

      await expect(service.findAll(userId, projectId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.findManyByProjectOwner).not.toHaveBeenCalled();
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
        assigneeId: userId,
        ...baseDates,
      };
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue(row);

      const result = await service.findOne(userId, taskId);

      expect(mockTasksRepository.findByIdForProjectOwner).toHaveBeenCalledWith(taskId, userId);
      expect(result).toMatchObject({ id: taskId, status: TaskStatus.COMPLETED });
    });

    it('should throw when task not found', async () => {
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue(null);

      await expect(service.findOne(userId, taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = {
      id: taskId,
      title: 'Old',
      description: 'd',
      status: TaskStatus.PENDING,
      projectId,
      assigneeId: userId,
      ...baseDates,
    };

    it('should return existing when dto has no fields to apply', async () => {
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue({ ...existing });

      const result = await service.update(userId, taskId, {} as UpdateTaskDto);

      expect(mockTasksRepository.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: taskId, title: 'Old' });
    });

    it('should update when dto has changes', async () => {
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue({ ...existing });
      const updated = { ...existing, title: 'New', updatedAt: new Date('2026-01-03') };
      mockTasksRepository.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { title: 'New' };
      const result = await service.update(userId, taskId, dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith(taskId, { title: 'New' });
      expect(result).toMatchObject({ title: 'New' });
    });
  });

  describe('remove', () => {
    it('should throw when task not found', async () => {
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue(null);

      await expect(service.remove(userId, taskId)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete when task exists', async () => {
      mockTasksRepository.findByIdForProjectOwner.mockResolvedValue({
        id: taskId,
        title: 'T',
        description: null,
        status: TaskStatus.PENDING,
        projectId,
        assigneeId: userId,
        ...baseDates,
      });
      mockTasksRepository.delete.mockResolvedValue(undefined);

      await service.remove(userId, taskId);

      expect(mockTasksRepository.delete).toHaveBeenCalledWith(taskId);
    });
  });
});
