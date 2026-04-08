import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { TimeEntriesRepository } from '@/modules/time-entries/repository/time-entries.repository';
import { TimeEntriesService } from '@/modules/time-entries/service/time-entries.service';

const userId = 'user-1';

const baseEntry = {
  id: 'te-1',
  userId,
  projectId: 'p-1' as string | null,
  taskId: null as string | null,
  description: 'Work',
  startedAt: new Date('2026-01-01T10:00:00.000Z'),
  endedAt: null as Date | null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockTimeRepo = {
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  closeRunningForUser: jest.fn(),
};

const mockProjectsRepo = {
  findOne: jest.fn(),
};

const mockTasksRepo = {
  findOne: jest.fn(),
};

function buildAbility(id: string, withUpdate = true, withDelete = true): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'TimeEntry');
  can(Action.Read, 'TimeEntry', { userId: id });
  if (withUpdate) {
    can(Action.Update, 'TimeEntry', { userId: id });
  }
  if (withDelete) {
    can(Action.Delete, 'TimeEntry', { userId: id });
  }
  return build();
}

describe('TimeEntriesService', () => {
  let service: TimeEntriesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);

    mockProjectsRepo.findOne.mockResolvedValue({ id: 'p-1', name: 'P' });
    mockTasksRepo.findOne.mockResolvedValue({
      id: 't-1',
      projectId: 'p-1',
      title: 'T',
      description: null,
      status: 'PENDING',
      projectOwnerId: userId,
      projectCompanyId: null,
      assigneeId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockTimeRepo.create.mockImplementation((data: typeof baseEntry) =>
      Promise.resolve({
        ...baseEntry,
        ...data,
        id: 'new-id',
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeEntriesService,
        { provide: TimeEntriesRepository, useValue: mockTimeRepo },
        { provide: ProjectsRepository, useValue: mockProjectsRepo },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get(TimeEntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create closes other running timers when starting a new one', async () => {
    mockTimeRepo.create.mockResolvedValue({ ...baseEntry, id: 'x' });

    await service.create(userId, ability, {
      startedAt: '2026-01-02T10:00:00.000Z',
      projectId: 'p-1',
    });

    expect(mockTimeRepo.closeRunningForUser).toHaveBeenCalledWith(
      userId,
      new Date('2026-01-02T10:00:00.000Z'),
    );
    expect(mockTimeRepo.create).toHaveBeenCalled();
  });

  it('create does not close running when entry is completed', async () => {
    mockTimeRepo.create.mockResolvedValue({
      ...baseEntry,
      endedAt: new Date('2026-01-02T11:00:00.000Z'),
    });

    await service.create(userId, ability, {
      startedAt: '2026-01-02T10:00:00.000Z',
      endedAt: '2026-01-02T11:00:00.000Z',
    });

    expect(mockTimeRepo.closeRunningForUser).not.toHaveBeenCalled();
  });

  it('create rejects endedAt before startedAt', async () => {
    await expect(
      service.create(userId, ability, {
        startedAt: '2026-01-02T12:00:00.000Z',
        endedAt: '2026-01-02T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findRunning returns latest running entry', async () => {
    mockTimeRepo.findAll.mockResolvedValue([
      { ...baseEntry, id: 'a', startedAt: new Date('2026-01-01T08:00:00.000Z') },
      { ...baseEntry, id: 'b', startedAt: new Date('2026-01-02T08:00:00.000Z') },
    ]);

    const res = await service.findRunning(ability);
    expect(res?.id).toBe('b');
  });

  it('update throws when not allowed', async () => {
    const roAbility = buildAbility(userId, false);
    mockTimeRepo.findOne.mockResolvedValue(baseEntry);

    await expect(
      service.update('te-1', userId, roAbility, { description: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delete throws when entry missing', async () => {
    mockTimeRepo.findOne.mockResolvedValue(null);

    await expect(service.delete('missing', ability)).rejects.toBeInstanceOf(NotFoundException);
  });
});
