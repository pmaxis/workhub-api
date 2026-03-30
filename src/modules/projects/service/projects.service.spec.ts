import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

/** Authenticated user id; same value as `Project.ownerId` in these tests. */
const ownerId = 'user-1';
const projectId = 'proj-1';

const baseDates = {
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockProjectFromRepo = {
  id: projectId,
  name: 'P',
  description: null as string | null,
  ownerId,
  tasksCount: 0,
  ...baseDates,
};

const mockProjectsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
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
      mockProjectsRepository.create.mockResolvedValue({
        ...mockProjectFromRepo,
        name: dto.name,
        description: dto.description ?? null,
      });

      const result = await service.create(ownerId, dto);

      expect(mockProjectsRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        ownerId,
      });
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({
        id: projectId,
        name: dto.name,
        ownerId,
        tasksCount: 0,
      });
    });
  });

  describe('findAll', () => {
    it('should return projects for owner', async () => {
      const row = { ...mockProjectFromRepo, tasksCount: 2 };
      mockProjectsRepository.findAll.mockResolvedValue([row]);

      const result = await service.findAll(ownerId);

      expect(mockProjectsRepository.findAll).toHaveBeenCalledWith(ownerId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProjectResponseDto);
      expect(result[0]).toMatchObject({ id: projectId, tasksCount: 2 });
    });
  });

  describe('findOne', () => {
    it('should return project when found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(mockProjectFromRepo);

      const result = await service.findOne(ownerId, projectId);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ownerId);
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({ id: projectId });
    });

    it('should throw when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(ownerId, projectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = { ...mockProjectFromRepo, name: 'Old', description: 'd' };

    it('should return current project when dto has no fields to apply', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ ...existing });

      const result = await service.update(ownerId, projectId, {} as UpdateProjectDto);

      expect(mockProjectsRepository.update).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({ id: projectId, name: 'Old' });
    });

    it('should update when dto has changes', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ ...existing });
      const updated = {
        ...existing,
        name: 'New',
        updatedAt: new Date('2026-01-03'),
      };
      mockProjectsRepository.update.mockResolvedValue(updated);

      const dto: UpdateProjectDto = { name: 'New' };
      const result = await service.update(ownerId, projectId, dto);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ownerId);
      expect(mockProjectsRepository.update).toHaveBeenCalledWith(projectId, { name: 'New' });
      expect(result).toMatchObject({ name: 'New' });
    });

    it('should throw when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(ownerId, projectId, { name: 'N' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProjectsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should throw when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(ownerId, projectId)).rejects.toThrow(NotFoundException);
      expect(mockProjectsRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete project via repository', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(mockProjectFromRepo);
      mockProjectsRepository.delete.mockResolvedValue(undefined);

      await service.delete(ownerId, projectId);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ownerId);
      expect(mockProjectsRepository.delete).toHaveBeenCalledWith(projectId);
    });
  });
});
