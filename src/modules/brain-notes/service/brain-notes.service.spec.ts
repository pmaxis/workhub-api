import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import type { MappedTask } from '@/modules/tasks/repository/tasks.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import type { MappedBrainNote } from '@/modules/brain-notes/repository/brain-notes.repository';
import { BrainNotesRepository } from '@/modules/brain-notes/repository/brain-notes.repository';
import { BrainNotesService } from '@/modules/brain-notes/service/brain-notes.service';

const userId = 'user-1';

const mappedNote: MappedBrainNote = {
  id: 'n-1',
  userId,
  taskId: null,
  title: 'Title',
  body: 'Body text',
  tags: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const mockTask: MappedTask = {
  id: 't-1',
  title: 'My task',
  description: null,
  status: TaskStatus.PENDING,
  projectId: 'p-1',
  projectOwnerId: userId,
  projectCompanyId: null,
  assigneeId: userId,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockBrainNotesRepo = {
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
  can(Action.Create, 'BrainNote');
  can(Action.Read, 'BrainNote', { userId: id });
  can(Action.Update, 'BrainNote', { userId: id });
  can(Action.Delete, 'BrainNote', { userId: id });
  return build();
}

function buildReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'BrainNote', { userId: id });
  return build();
}

describe('BrainNotesService', () => {
  let service: BrainNotesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockBrainNotesRepo.create.mockResolvedValue(mappedNote);
    mockBrainNotesRepo.findOne.mockResolvedValue(mappedNote);
    mockBrainNotesRepo.findAll.mockResolvedValue({
      data: [mappedNote],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockBrainNotesRepo.update.mockResolvedValue(mappedNote);
    mockTasksRepo.findOne.mockResolvedValue(mockTask);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrainNotesService,
        { provide: BrainNotesRepository, useValue: mockBrainNotesRepo },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get(BrainNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create persists note without task', async () => {
    const res = await service.create(userId, ability, { title: '  A  ', body: 'b' });
    expect(mockBrainNotesRepo.create).toHaveBeenCalledWith({
      userId,
      taskId: null,
      title: 'A',
      body: 'b',
      tags: null,
    });
    expect(res.title).toBe('Title');
  });

  it('create resolves taskId when task exists', async () => {
    await service.create(userId, ability, { title: 'x', body: '', taskId: 't-1' });
    expect(mockTasksRepo.findOne).toHaveBeenCalledWith('t-1', ability);
    expect(mockBrainNotesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId, taskId: 't-1', title: 'x' }),
    );
  });

  it('create throws when task not found', async () => {
    mockTasksRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create(userId, ability, { title: 'x', body: '', taskId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne throws when missing', async () => {
    mockBrainNotesRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll maps rows to response DTOs', async () => {
    const res = await service.findAll(ability, { page: 1, limit: 10 });
    expect(res.total).toBe(1);
    expect(res.data[0].title).toBe('Title');
  });

  it('update returns existing when dto empty', async () => {
    const res = await service.update('n-1', ability, {});
    expect(mockBrainNotesRepo.update).not.toHaveBeenCalled();
    expect(res.id).toBe(mappedNote.id);
  });

  it('update throws when task not found', async () => {
    mockTasksRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.update('n-1', ability, { taskId: 'bad' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update throws when forbidden', async () => {
    const readOnly = buildReadOnlyAbility(userId);
    await expect(service.update('n-1', readOnly, { title: 'n' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delete calls repository when allowed', async () => {
    await service.delete('n-1', ability);
    expect(mockBrainNotesRepo.delete).toHaveBeenCalledWith('n-1');
  });

  it('delete throws when forbidden', async () => {
    const readOnly = buildReadOnlyAbility(userId);
    await expect(service.delete('n-1', readOnly)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
