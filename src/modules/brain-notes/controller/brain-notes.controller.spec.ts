import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { BrainNotesController } from '@/modules/brain-notes/controller/brain-notes.controller';
import { BrainNotesService } from '@/modules/brain-notes/service/brain-notes.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'BrainNote');
  can(Action.Read, 'BrainNote', { userId });
  can(Action.Update, 'BrainNote', { userId });
  can(Action.Delete, 'BrainNote', { userId });
  return build();
}

describe('BrainNotesController', () => {
  let controller: BrainNotesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrainNotesController],
      providers: [{ provide: BrainNotesService, useValue: mockService }],
    }).compile();

    controller = module.get(BrainNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'n1' });
    const dto = { title: 'x', body: 'y' };
    const res = await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
    expect(res).toEqual({ id: 'n1' });
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, {});
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'n1' });
    await controller.findOne('n1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('n1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'n1' });
    await controller.update('n1', { title: 'z' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('n1', ability, { title: 'z' });
  });

  it('delete delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.delete('n1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('n1', ability);
  });
});
