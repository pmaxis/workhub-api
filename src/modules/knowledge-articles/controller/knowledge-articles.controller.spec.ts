import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { KnowledgeArticlesController } from '@/modules/knowledge-articles/controller/knowledge-articles.controller';
import { KnowledgeArticlesService } from '@/modules/knowledge-articles/service/knowledge-articles.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'KnowledgeArticle');
  can(Action.Read, 'KnowledgeArticle', { userId });
  can(Action.Update, 'KnowledgeArticle', { userId });
  can(Action.Delete, 'KnowledgeArticle', { userId });
  return build();
}

describe('KnowledgeArticlesController', () => {
  let controller: KnowledgeArticlesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeArticlesController],
      providers: [{ provide: KnowledgeArticlesService, useValue: mockService }],
    }).compile();

    controller = module.get(KnowledgeArticlesController);
  });

  it('create delegates', async () => {
    mockService.create.mockResolvedValue({ id: 'a1' });
    const dto = { title: 'x', body: 'y' };
    const res = await controller.create(dto, 'u1', ability);
    expect(mockService.create).toHaveBeenCalledWith('u1', ability, dto);
    expect(res).toEqual({ id: 'a1' });
  });

  it('findAll delegates', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });
    await controller.findAll({}, ability);
    expect(mockService.findAll).toHaveBeenCalledWith(ability, {});
  });

  it('findOne delegates', async () => {
    mockService.findOne.mockResolvedValue({ id: 'a1' });
    await controller.findOne('a1', ability);
    expect(mockService.findOne).toHaveBeenCalledWith('a1', ability);
  });

  it('update delegates', async () => {
    mockService.update.mockResolvedValue({ id: 'a1' });
    await controller.update('a1', { title: 'z' }, ability);
    expect(mockService.update).toHaveBeenCalledWith('a1', ability, { title: 'z' });
  });

  it('remove delegates', async () => {
    mockService.delete.mockResolvedValue(undefined);
    await controller.remove('a1', ability);
    expect(mockService.delete).toHaveBeenCalledWith('a1', ability);
  });
});
