import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { ProjectsController } from '@/modules/projects/controller/projects.controller';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { QueryProjectsDto } from '@/modules/projects/dto/query-projects.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Project', { ownerId: userId });
  can(Action.Create, 'Project');
  can(Action.Update, 'Project', { ownerId: userId });
  can(Action.Delete, 'Project', { ownerId: userId });
  return build();
}

const makeProject = (ownerId: string) =>
  new ProjectResponseDto({
    id: '1',
    name: 'P',
    description: null,
    ownerId,
    companyId: null,
    tasksCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');

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
      const dto: CreateProjectDto = { name: 'P' };
      const created = makeProject('u1');
      mockProjectsService.create.mockResolvedValue(created);

      const result = await controller.create(dto, 'u1');

      expect(result).toEqual(created);
      expect(mockProjectsService.create).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const paginated = { data: [makeProject('u1')], total: 1, page: 1, limit: 20 };
      mockProjectsService.findAll.mockResolvedValue(paginated);

      const query: QueryProjectsDto = { page: 1, limit: 20 };
      const result = await controller.findAll(query, ability);

      expect(result).toEqual(paginated);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith(ability, query);
    });
  });

  describe('findOne', () => {
    it('should return project by id', async () => {
      const project = makeProject('u1');
      mockProjectsService.findOne.mockResolvedValue(project);

      const result = await controller.findOne('1', ability);

      expect(result).toEqual(project);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('1', ability);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const dto: UpdateProjectDto = { name: 'New' };
      const updated = makeProject('u1');
      mockProjectsService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto, ability);

      expect(result).toEqual(updated);
      expect(mockProjectsService.update).toHaveBeenCalledWith('1', ability, dto);
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      mockProjectsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1', ability);

      expect(result).toBeUndefined();
      expect(mockProjectsService.delete).toHaveBeenCalledWith('1', ability);
    });
  });
});
