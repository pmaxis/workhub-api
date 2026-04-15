import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { TasksController } from '@/modules/tasks/controller/tasks.controller';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

const mockTasksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  can(Action.Create, 'Task');
  can(Action.Update, 'Task', { projectOwnerId: userId });
  can(Action.Delete, 'Task', { projectOwnerId: userId });
  return build();
}

describe('TasksController', () => {
  let controller: TasksController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service', async () => {
      const ownerId = 'u1';
      const dto: CreateTaskDto = { title: 'T', projectId: 'p1' };
      const created = new TaskResponseDto({
        id: '1',
        title: dto.title,
        description: null,
        status: TaskStatus.PENDING,
        dueAt: null,
        projectId: dto.projectId,
        assigneeId: ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockTasksService.create.mockResolvedValue(created);

      const result = await controller.create(dto, ownerId, ability);

      expect(result).toEqual(created);
      expect(mockTasksService.create).toHaveBeenCalledWith(ownerId, ability, dto);
    });
  });

  describe('findAll', () => {
    it('should return tasks without project filter', async () => {
      const ownerId = 'u1';
      const tasks = [
        new TaskResponseDto({
          id: '1',
          title: 'T',
          description: null,
          status: TaskStatus.PENDING,
          dueAt: null,
          projectId: 'p1',
          assigneeId: ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];
      mockTasksService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll(undefined, undefined, undefined, ownerId, ability);

      expect(result).toEqual(tasks);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        ownerId,
        ability,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should pass projectId query when provided', async () => {
      const ownerId = 'u1';
      mockTasksService.findAll.mockResolvedValue([]);

      await controller.findAll('p1', undefined, undefined, ownerId, ability);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        ownerId,
        ability,
        'p1',
        undefined,
        undefined,
      );
    });

    it('should pass dueFrom and dueTo query when provided', async () => {
      const ownerId = 'u1';
      mockTasksService.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, '2026-04-01', '2026-04-30', ownerId, ability);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        ownerId,
        ability,
        undefined,
        '2026-04-01',
        '2026-04-30',
      );
    });
  });

  describe('findOne', () => {
    it('should return task by id', async () => {
      const task = new TaskResponseDto({
        id: '1',
        title: 'T',
        description: null,
        status: TaskStatus.COMPLETED,
        dueAt: null,
        projectId: 'p1',
        assigneeId: 'u1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockTasksService.findOne.mockResolvedValue(task);

      const result = await controller.findOne('1', 'u1', ability);

      expect(result).toEqual(task);
      expect(mockTasksService.findOne).toHaveBeenCalledWith('1', 'u1', ability);
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const dto: UpdateTaskDto = { title: 'New' };
      const updated = new TaskResponseDto({
        id: '1',
        title: 'New',
        description: null,
        status: TaskStatus.PENDING,
        dueAt: null,
        projectId: 'p1',
        assigneeId: 'u1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockTasksService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto, 'u1', ability);

      expect(result).toEqual(updated);
      expect(mockTasksService.update).toHaveBeenCalledWith('1', 'u1', ability, dto);
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      mockTasksService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1', ability);

      expect(result).toBeUndefined();
      expect(mockTasksService.delete).toHaveBeenCalledWith('1', ability);
    });
  });
});
