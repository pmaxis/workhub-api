import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';

const userId = 'user-1';
const projectId = 'proj-1';

const baseDates = {
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockProjectsRepository = {
  create: jest.fn(),
  findManyByOwner: jest.fn(),
  findByIdForOwner: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTx = {
  task: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  project: { delete: jest.fn().mockResolvedValue({ id: projectId }) },
};

const mockDatabaseService = {
  $transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create project for user', async () => {
      const dto: CreateProjectDto = { name: 'P', description: 'desc' };
      const row = {
        id: projectId,
        name: dto.name,
        description: dto.description ?? null,
        ownerId: userId,
        _count: { tasks: 0 },
        ...baseDates,
      };
      mockProjectsRepository.create.mockResolvedValue(row);

      const result = await service.create(userId, dto);

      expect(mockProjectsRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      });
      expect(result).toMatchObject({
        id: projectId,
        name: dto.name,
        ownerId: userId,
        tasksCount: 0,
      });
    });
  });

  describe('findAll', () => {
    it('should return projects for owner', async () => {
      const row = {
        id: projectId,
        name: 'P',
        description: null,
        ownerId: userId,
        _count: { tasks: 2 },
        ...baseDates,
      };
      mockProjectsRepository.findManyByOwner.mockResolvedValue([row]);

      const result = await service.findAll(userId);

      expect(mockProjectsRepository.findManyByOwner).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: projectId, tasksCount: 2 });
    });
  });

  describe('findOne', () => {
    it('should return project when found', async () => {
      const row = {
        id: projectId,
        name: 'P',
        description: null,
        ownerId: userId,
        _count: { tasks: 0 },
        ...baseDates,
      };
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(row);

      const result = await service.findOne(userId, projectId);

      expect(mockProjectsRepository.findByIdForOwner).toHaveBeenCalledWith(projectId, userId);
      expect(result).toMatchObject({ id: projectId });
    });

    it('should throw when project not found', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(null);

      await expect(service.findOne(userId, projectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = {
      id: projectId,
      name: 'Old',
      description: 'd',
      ownerId: userId,
      _count: { tasks: 0 },
      ...baseDates,
    };

    it('should return existing when dto has no changes', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({ ...existing });

      const result = await service.update(userId, projectId, {} as UpdateProjectDto);

      expect(mockProjectsRepository.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: projectId, name: 'Old' });
    });

    it('should update when dto has changes', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({ ...existing });
      const updated = {
        ...existing,
        name: 'New',
        _count: { tasks: 0 },
        updatedAt: new Date('2026-01-03'),
      };
      mockProjectsRepository.update.mockResolvedValue(updated);

      const dto: UpdateProjectDto = { name: 'New' };
      const result = await service.update(userId, projectId, dto);

      expect(mockProjectsRepository.update).toHaveBeenCalledWith(projectId, { name: 'New' });
      expect(result).toMatchObject({ name: 'New' });
    });

    it('should throw when project not found', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(null);

      await expect(service.update(userId, projectId, { name: 'N' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should throw when project not found', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue(null);

      await expect(service.remove(userId, projectId)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.$transaction).not.toHaveBeenCalled();
    });

    it('should delete tasks and project in transaction', async () => {
      mockProjectsRepository.findByIdForOwner.mockResolvedValue({
        id: projectId,
        name: 'P',
        description: null,
        ownerId: userId,
        _count: { tasks: 1 },
        ...baseDates,
      });

      await service.remove(userId, projectId);

      expect(mockDatabaseService.$transaction).toHaveBeenCalled();
      expect(mockTx.task.deleteMany).toHaveBeenCalledWith({ where: { projectId } });
      expect(mockTx.project.delete).toHaveBeenCalledWith({ where: { id: projectId } });
    });
  });
});
