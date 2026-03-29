import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '@/modules/tasks/controller/tasks.controller';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';

const mockTasksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    jest.clearAllMocks();
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
      const userId = 'u1';
      const dto: CreateTaskDto = { title: 'T', projectId: 'p1' };
      const created = { id: '1', ...dto };
      mockTasksService.create.mockResolvedValue(created);

      const result = await controller.create(dto, userId);

      expect(result).toEqual(created);
      expect(mockTasksService.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should return tasks without project filter', async () => {
      const userId = 'u1';
      const tasks = [{ id: '1' }];
      mockTasksService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll(userId);

      expect(result).toEqual(tasks);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(userId, undefined);
    });

    it('should pass projectId query when provided', async () => {
      const userId = 'u1';
      mockTasksService.findAll.mockResolvedValue([]);

      await controller.findAll(userId, 'p1');

      expect(mockTasksService.findAll).toHaveBeenCalledWith(userId, 'p1');
    });
  });

  describe('findOne', () => {
    it('should return task by id', async () => {
      const task = { id: '1', title: 'T' };
      mockTasksService.findOne.mockResolvedValue(task);

      const result = await controller.findOne('1', 'u1');

      expect(result).toEqual(task);
      expect(mockTasksService.findOne).toHaveBeenCalledWith('u1', '1');
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const dto: UpdateTaskDto = { title: 'New' };
      const updated = { id: '1', title: 'New' };
      mockTasksService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto, 'u1');

      expect(result).toEqual(updated);
      expect(mockTasksService.update).toHaveBeenCalledWith('u1', '1', dto);
    });
  });

  describe('remove', () => {
    it('should remove task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', 'u1');

      expect(result).toBeUndefined();
      expect(mockTasksService.remove).toHaveBeenCalledWith('u1', '1');
    });
  });
});
