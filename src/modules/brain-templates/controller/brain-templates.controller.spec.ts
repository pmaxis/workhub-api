import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { BrainTemplatesController } from '@/modules/brain-templates/controller/brain-templates.controller';
import { BrainTemplatesService } from '@/modules/brain-templates/service/brain-templates.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'BrainTemplate');
  can(Action.Read, 'BrainTemplate', { userId });
  can(Action.Update, 'BrainTemplate', { userId });
  can(Action.Delete, 'BrainTemplate', { userId });
  return build();
}

describe('BrainTemplatesController', () => {
  let controller: BrainTemplatesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrainTemplatesController],
      providers: [{ provide: BrainTemplatesService, useValue: mockService }],
    }).compile();

    controller = module.get(BrainTemplatesController);
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 't1' });
    const dto = { title: 'x', body: 'y' };
    await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, {});
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'tpl1' });
    await controller.findOne('tpl1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('tpl1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'tpl1' });
    await controller.update('tpl1', { title: 'z' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('tpl1', ability, { title: 'z' });
  });

  it('remove delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.remove('tpl1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('tpl1', ability);
  });
});
