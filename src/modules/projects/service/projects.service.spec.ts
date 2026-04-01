import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { QueryProjectsDto } from '@/modules/projects/dto/query-projects.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

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
  companyId: null as string | null,
  tasksCount: 0,
  ...baseDates,
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Project', { ownerId: userId });
  can(Action.Create, 'Project');
  can(Action.Update, 'Project', { ownerId: userId });
  can(Action.Delete, 'Project', { ownerId: userId });
  return build();
}

const mockProjectsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(ownerId);

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
        companyId: undefined,
      });
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({ id: projectId, name: dto.name, ownerId, tasksCount: 0 });
    });
  });

  describe('findAll', () => {
    it('should return paginated projects for owner', async () => {
      const paginatedResult = {
        data: [{ ...mockProjectFromRepo, tasksCount: 2 }],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockProjectsRepository.findAll.mockResolvedValue(paginatedResult);

      const query: QueryProjectsDto = { page: 1, limit: 20 };
      const result = await service.findAll(ability, query);

      expect(mockProjectsRepository.findAll).toHaveBeenCalledWith({
        ability,
        search: undefined,
        companyId: undefined,
        page: 1,
        limit: 20,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ProjectResponseDto);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return project when found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(mockProjectFromRepo);

      const result = await service.findOne(projectId, ability);

      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith(projectId, ability);
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({ id: projectId });
    });

    it('should throw when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(projectId, ability)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should return current project when dto has no fields', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ ...mockProjectFromRepo });

      const result = await service.update(projectId, ability, {} as UpdateProjectDto);

      expect(mockProjectsRepository.update).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(ProjectResponseDto);
      expect(result).toMatchObject({ id: projectId });
    });

    it('should update when dto has changes', async () => {
      mockProjectsRepository.findOne.mockResolvedValue({ ...mockProjectFromRepo });
      const updated = { ...mockProjectFromRepo, name: 'New', updatedAt: new Date('2026-01-03') };
      mockProjectsRepository.update.mockResolvedValue(updated);

      const result = await service.update(projectId, ability, { name: 'New' });

      expect(mockProjectsRepository.update).toHaveBeenCalledWith(projectId, { name: 'New' });
      expect(result).toMatchObject({ name: 'New' });
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(projectId, ability, { name: 'N' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own project', async () => {
      const foreignProject = { ...mockProjectFromRepo, ownerId: 'other-user' };
      mockProjectsRepository.findOne.mockResolvedValue(foreignProject);

      await expect(service.update(projectId, ability, { name: 'N' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should throw when project not found', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(projectId, ability)).rejects.toThrow(NotFoundException);
      expect(mockProjectsRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete project via repository', async () => {
      mockProjectsRepository.findOne.mockResolvedValue(mockProjectFromRepo);
      mockProjectsRepository.delete.mockResolvedValue(undefined);

      await service.delete(projectId, ability);

      expect(mockProjectsRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should throw ForbiddenException when user does not own project', async () => {
      const foreignProject = { ...mockProjectFromRepo, ownerId: 'other-user' };
      mockProjectsRepository.findOne.mockResolvedValue(foreignProject);

      await expect(service.delete(projectId, ability)).rejects.toThrow(ForbiddenException);
    });
  });
});
