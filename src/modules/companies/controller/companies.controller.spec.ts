import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { CompaniesController } from '@/modules/companies/controller/companies.controller';
import { CompaniesService } from '@/modules/companies/service/companies.service';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';

const mockCompaniesService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function buildUpdateAbility(companyId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Update, 'Company', { id: companyId });
  return build();
}

function buildDeleteAbility(companyId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Delete, 'Company', { id: companyId });
  return build();
}

const makeCompanyDto = (id: string) => new CompanyResponseDto({ id, name: 'Acme', slug: 'acme' });

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildUpdateAbility('co-1');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: mockCompaniesService }],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to service', async () => {
      const list = [makeCompanyDto('co-1')];
      mockCompaniesService.findAll.mockResolvedValue(list);

      const result = await controller.findAll('user-1');

      expect(result).toEqual(list);
      expect(mockCompaniesService.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create', () => {
    it('should delegate to service', async () => {
      const dto: CreateCompanyDto = { name: 'Acme Corp' };
      const created = makeCompanyDto('co-new');
      mockCompaniesService.create.mockResolvedValue(created);

      const result = await controller.create('user-1', dto);

      expect(result).toEqual(created);
      expect(mockCompaniesService.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('update', () => {
    it('should delegate to service', async () => {
      const dto: UpdateCompanyDto = { name: 'New name' };
      const updated = makeCompanyDto('co-1');
      mockCompaniesService.update.mockResolvedValue(updated);

      const result = await controller.update('co-1', 'user-1', dto, ability);

      expect(result).toEqual(updated);
      expect(mockCompaniesService.update).toHaveBeenCalledWith('co-1', 'user-1', ability, dto);
    });
  });

  describe('delete', () => {
    it('should delegate to service', async () => {
      const deleteAbility = buildDeleteAbility('co-1');
      mockCompaniesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('co-1', 'user-1', deleteAbility);

      expect(result).toBeUndefined();
      expect(mockCompaniesService.delete).toHaveBeenCalledWith('co-1', 'user-1', deleteAbility);
    });
  });
});
