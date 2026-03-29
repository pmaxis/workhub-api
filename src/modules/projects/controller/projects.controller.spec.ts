import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '@/modules/projects/controller/projects.controller';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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
      const created = { id: '1', ...dto };
      mockProjectsService.create.mockResolvedValue(created);

      const result = await controller.create(dto, userId);

      expect(result).toEqual(created);
      expect(mockProjectsService.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should return projects', async () => {
      const projects = [{ id: '1', name: 'P' }];
      mockProjectsService.findAll.mockResolvedValue(projects);

      const result = await controller.findAll('u1');

      expect(result).toEqual(projects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('u1');
    });
  });

  describe('findOne', () => {
    it('should return project by id', async () => {
      const project = { id: '1', name: 'P' };
      mockProjectsService.findOne.mockResolvedValue(project);

      const result = await controller.findOne('1', 'u1');

      expect(result).toEqual(project);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('u1', '1');
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const dto: UpdateProjectDto = { name: 'New' };
      const updated = { id: '1', name: 'New' };
      mockProjectsService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto, 'u1');

      expect(result).toEqual(updated);
      expect(mockProjectsService.update).toHaveBeenCalledWith('u1', '1', dto);
    });
  });

  describe('remove', () => {
    it('should remove project', async () => {
      mockProjectsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', 'u1');

      expect(result).toBeUndefined();
      expect(mockProjectsService.remove).toHaveBeenCalledWith('u1', '1');
    });
  });
});
