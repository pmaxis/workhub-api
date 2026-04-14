import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import type { MappedTask } from '@/modules/tasks/repository/tasks.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import type { MappedKnowledgeArticle } from '@/modules/knowledge-articles/repository/knowledge-articles.repository';
import { KnowledgeArticlesRepository } from '@/modules/knowledge-articles/repository/knowledge-articles.repository';
import { KnowledgeArticlesService } from '@/modules/knowledge-articles/service/knowledge-articles.service';

const userId = 'user-1';

const mappedArticle: MappedKnowledgeArticle = {
  id: 'a-1',
  userId,
  taskId: null,
  title: 'Article',
  body: 'Content',
  tags: 'ref',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockTask: MappedTask = {
  id: 't-1',
  title: 'Task',
  description: null,
  status: TaskStatus.IN_PROGRESS,
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
  can(Action.Create, 'KnowledgeArticle');
  can(Action.Read, 'KnowledgeArticle', { userId: id });
  can(Action.Update, 'KnowledgeArticle', { userId: id });
  can(Action.Delete, 'KnowledgeArticle', { userId: id });
  return build();
}

function buildReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'KnowledgeArticle', { userId: id });
  return build();
}

describe('KnowledgeArticlesService', () => {
  let service: KnowledgeArticlesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockRepo.create.mockResolvedValue(mappedArticle);
    mockRepo.findOne.mockResolvedValue(mappedArticle);
    mockRepo.findAll.mockResolvedValue({
      data: [mappedArticle],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockRepo.update.mockResolvedValue(mappedArticle);
    mockTasksRepo.findOne.mockResolvedValue(mockTask);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeArticlesService,
        { provide: KnowledgeArticlesRepository, useValue: mockRepo },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get(KnowledgeArticlesService);
  });

  it('create persists article', async () => {
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
      service.create(userId, ability, { title: 'x', body: 'y', taskId: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne throws when missing', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('missing', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll maps data', async () => {
    const res = await service.findAll(ability, {});
    expect(res.data[0].title).toBe('Article');
  });

  it('update returns existing when dto empty', async () => {
    await service.update('a-1', ability, {});
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('update throws when forbidden', async () => {
    await expect(
      service.update('a-1', buildReadOnlyAbility(userId), { title: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delete calls repository', async () => {
    await service.delete('a-1', ability);
    expect(mockRepo.delete).toHaveBeenCalledWith('a-1');
  });
});
