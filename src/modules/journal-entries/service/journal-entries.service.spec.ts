import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import type { MappedJournalEntry } from '@/modules/journal-entries/repository/journal-entries.repository';
import { JournalEntriesRepository } from '@/modules/journal-entries/repository/journal-entries.repository';
import { JournalEntriesService } from '@/modules/journal-entries/service/journal-entries.service';

const userId = 'user-1';

const mappedEntry: MappedJournalEntry = {
  id: 'j-1',
  userId,
  entryDate: new Date('2026-04-15T12:00:00.000Z'),
  title: 'Day',
  body: 'Notes',
  mood: 'ok',
  createdAt: new Date('2026-04-15'),
  updatedAt: new Date('2026-04-15'),
};

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'BrainJournalEntry');
  can(Action.Read, 'BrainJournalEntry', { userId: id });
  can(Action.Update, 'BrainJournalEntry', { userId: id });
  can(Action.Delete, 'BrainJournalEntry', { userId: id });
  return build();
}

function buildReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'BrainJournalEntry', { userId: id });
  return build();
}

describe('JournalEntriesService', () => {
  let service: JournalEntriesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockRepo.create.mockResolvedValue(mappedEntry);
    mockRepo.findOne.mockResolvedValue(mappedEntry);
    mockRepo.findAll.mockResolvedValue({
      data: [mappedEntry],
      total: 1,
      page: 1,
      limit: 20,
    });
    mockRepo.update.mockResolvedValue(mappedEntry);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalEntriesService, { provide: JournalEntriesRepository, useValue: mockRepo }],
    }).compile();

    service = module.get(JournalEntriesService);
  });

  it('create parses entryDate and trims title', async () => {
    await service.create(userId, ability, {
      entryDate: '2026-05-01T00:00:00.000Z',
      title: '  Hello  ',
      body: 'B',
      mood: '  calm  ',
    });
    expect(mockRepo.create).toHaveBeenCalledWith({
      userId,
      entryDate: new Date('2026-05-01T12:00:00.000Z'),
      title: 'Hello',
      body: 'B',
      mood: 'calm',
    });
  });

  it('create omits null title and mood when empty', async () => {
    await service.create(userId, ability, {
      entryDate: '2026-05-02',
      body: 'only',
    });
    expect(mockRepo.create).toHaveBeenCalledWith({
      userId,
      entryDate: new Date('2026-05-02T12:00:00.000Z'),
      title: null,
      body: 'only',
      mood: null,
    });
  });

  it('findOne throws when missing', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('x', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll passes date filters to repository', async () => {
    await service.findAll(ability, { from: '2026-01-01', to: '2026-01-31', q: 'x' });
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      ability,
      from: '2026-01-01',
      to: '2026-01-31',
      q: 'x',
      page: 1,
      limit: 20,
    });
  });

  it('update returns existing when dto empty', async () => {
    await service.update('j-1', ability, {});
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('update throws when forbidden', async () => {
    await expect(
      service.update('j-1', buildReadOnlyAbility(userId), { body: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delete calls repository', async () => {
    await service.delete('j-1', ability);
    expect(mockRepo.delete).toHaveBeenCalledWith('j-1');
  });
});
