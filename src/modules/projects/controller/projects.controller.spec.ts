import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '@/modules/projects/controller/projects.controller';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: mockProjectsService }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service', async () => {
      const userId = 'u1';
      const dto: CreateProjectDto = { name: 'P' };
      const created = new ProjectResponseDto({
        id: '1',
        name: 'P',
        description: null,
        ownerId: userId,
        tasksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockProjectsService.create.mockResolvedValue(created);

      const result = await controller.create(dto, userId);

      expect(result).toEqual(created);
      expect(mockProjectsService.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should return projects', async () => {
      const projects = [
        new ProjectResponseDto({
          id: '1',
          name: 'P',
          description: null,
          ownerId: 'u1',
          tasksCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];
      mockProjectsService.findAll.mockResolvedValue(projects);

      const result = await controller.findAll('u1');

      expect(result).toEqual(projects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('u1');
    });
  });

  describe('findOne', () => {
    it('should return project by id', async () => {
      const project = new ProjectResponseDto({
        id: '1',
        name: 'P',
        description: null,
        ownerId: 'u1',
        tasksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockProjectsService.findOne.mockResolvedValue(project);

      const result = await controller.findOne('1', 'u1');

      expect(result).toEqual(project);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('u1', '1');
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const dto: UpdateProjectDto = { name: 'New' };
      const updated = new ProjectResponseDto({
        id: '1',
        name: 'New',
        description: null,
        ownerId: 'u1',
        tasksCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockProjectsService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto, 'u1');

      expect(result).toEqual(updated);
      expect(mockProjectsService.update).toHaveBeenCalledWith('u1', '1', dto);
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      mockProjectsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1', 'u1');

      expect(result).toBeUndefined();
      expect(mockProjectsService.delete).toHaveBeenCalledWith('u1', '1');
    });
  });
});
