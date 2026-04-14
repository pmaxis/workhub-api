import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { JournalEntriesController } from '@/modules/journal-entries/controller/journal-entries.controller';
import { JournalEntriesService } from '@/modules/journal-entries/service/journal-entries.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'BrainJournalEntry');
  can(Action.Read, 'BrainJournalEntry', { userId });
  can(Action.Update, 'BrainJournalEntry', { userId });
  can(Action.Delete, 'BrainJournalEntry', { userId });
  return build();
}

describe('JournalEntriesController', () => {
  let controller: JournalEntriesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalEntriesController],
      providers: [{ provide: JournalEntriesService, useValue: mockService }],
    }).compile();

    controller = module.get(JournalEntriesController);
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'j1' });
    const dto = { entryDate: '2026-04-15', body: 'x' };
    await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, {});
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'j1' });
    await controller.findOne('j1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('j1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'j1' });
    await controller.update('j1', { body: 'y' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('j1', ability, { body: 'y' });
  });

  it('remove delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.remove('j1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('j1', ability);
  });
});
