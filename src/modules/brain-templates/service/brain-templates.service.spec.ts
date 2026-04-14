import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import type { MappedTask } from '@/modules/tasks/repository/tasks.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import type { MappedBrainTemplate } from '@/modules/brain-templates/repository/brain-templates.repository';
import { BrainTemplatesRepository } from '@/modules/brain-templates/repository/brain-templates.repository';
import { BrainTemplatesService } from '@/modules/brain-templates/service/brain-templates.service';

const userId = 'user-1';

const mappedTemplate: MappedBrainTemplate = {
  id: 'tpl-1',
  userId,
  taskId: null,
  title: 'Email',
  body: 'Hi…',
  tags: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockTask: MappedTask = {
  id: 't-1',
  title: 'Task',
  description: null,
  status: TaskStatus.COMPLETED,
  projectId: 'p-1',
  projectOwnerId: userId,
  projectCompanyId: null,
  assigneeId: userId,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTasksRepo = {
  findOne: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'BrainTemplate');
  can(Action.Read, 'BrainTemplate', { userId: id });
  can(Action.Update, 'BrainTemplate', { userId: id });
  can(Action.Delete, 'BrainTemplate', { userId: id });
  return build();
}

function buildReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'BrainTemplate', { userId: id });
  return build();
}

describe('BrainTemplatesService', () => {
  let service: BrainTemplatesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockRepo.create.mockResolvedValue(mappedTemplate);
    mockRepo.findOne.mockResolvedValue(mappedTemplate);
    mockRepo.findAll.mockResolvedValue({
      data: [mappedTemplate],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockRepo.update.mockResolvedValue(mappedTemplate);
    mockTasksRepo.findOne.mockResolvedValue(mockTask);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrainTemplatesService,
        { provide: BrainTemplatesRepository, useValue: mockRepo },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get(BrainTemplatesService);
  });

  it('create persists template', async () => {
    await service.create(userId, ability, { title: 'T', body: 'B' });
    expect(mockRepo.create).toHaveBeenCalledWith({
      userId,
      taskId: null,
      title: 'T',
      body: 'B',
      tags: null,
    });
  });

  it('create throws when task not found', async () => {
    mockTasksRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create(userId, ability, { title: 'a', body: 'b', taskId: 'z' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne throws when missing', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll maps data', async () => {
    const res = await service.findAll(ability, { taskId: 't-1' });
    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ ability, taskId: 't-1' }),
    );
    expect(res.data[0].title).toBe('Email');
  });

  it('update returns existing when dto empty', async () => {
    await service.update('tpl-1', ability, {});
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('update throws when forbidden', async () => {
    await expect(
      service.update('tpl-1', buildReadOnlyAbility(userId), { title: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delete calls repository', async () => {
    await service.delete('tpl-1', ability);
    expect(mockRepo.delete).toHaveBeenCalledWith('tpl-1');
  });
});
