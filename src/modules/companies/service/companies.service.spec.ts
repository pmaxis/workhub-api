import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { CompaniesRepository } from '@/modules/companies/repository/companies.repository';
import { CompaniesService } from '@/modules/companies/service/companies.service';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { CLIENT_ROLE_SLUG } from '@/common/constants/reserved';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';

const userId = 'user-1';
const companyId = 'co-1';

const mockCompaniesRepository = {
  findAllByUserId: jest.fn(),
  findUserForCreate: jest.fn(),
  isSlugTaken: jest.fn(),
  createWithMembership: jest.fn(),
  findOneWhereMember: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
};

const clientUserForCreate = {
  freelancerProfile: null as { id: string } | null,
  roles: [{ role: { slug: CLIENT_ROLE_SLUG } }],
  clientProfile: { id: 'cp-1' },
};

const freelancerUserForCreate = {
  freelancerProfile: { id: 'fp-1' },
  roles: [{ role: { slug: CLIENT_ROLE_SLUG } }],
  clientProfile: null as { id: string } | null,
};

const userWithoutClientRole = {
  freelancerProfile: null,
  roles: [{ role: { slug: 'freelancer' } }],
  clientProfile: { id: 'cp-1' },
};

const companyRow = {
  id: companyId,
  name: 'Acme',
  slug: 'acme',
};

function buildUpdateAbilityForCompany(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Company', { id });
  can(Action.Update, 'Company', { id });
  return build();
}

function buildEmptyAbility(): AppAbility {
  const { build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  return build();
}

function buildUpdateAbilityForOtherCompany(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Update, 'Company', { id: 'other-co' });
  return build();
}

function buildDeleteAbilityForCompany(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Company', { id });
  can(Action.Delete, 'Company', { id });
  return build();
}

function buildDeleteAbilityForOtherCompany(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Delete, 'Company', { id: 'other-co' });
  return build();
}

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: CompaniesRepository, useValue: mockCompaniesRepository },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should map companies to CompanyResponseDto', async () => {
      mockCompaniesRepository.findAllByUserId.mockResolvedValue([companyRow]);

      const result = await service.findAll(userId);

      expect(mockCompaniesRepository.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CompanyResponseDto);
      expect(result[0]).toMatchObject({ id: companyId, name: 'Acme', slug: 'acme' });
    });

    it('should return empty array when user has no companies', async () => {
      mockCompaniesRepository.findAllByUserId.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create company for client user', async () => {
      const dto: CreateCompanyDto = { name: '  Acme LLC  ' };
      mockCompaniesRepository.findUserForCreate.mockResolvedValue(clientUserForCreate);
      mockCompaniesRepository.isSlugTaken.mockResolvedValue(false);
      mockCompaniesRepository.createWithMembership.mockResolvedValue({
        id: 'new-co',
        name: 'Acme LLC',
        slug: 'acme-llc',
      });

      const result = await service.create(userId, dto);

      expect(mockCompaniesRepository.findUserForCreate).toHaveBeenCalledWith(userId);
      expect(mockCompaniesRepository.createWithMembership).toHaveBeenCalledWith({
        userId,
        name: 'Acme LLC',
        slug: 'acme-llc',
        clientProfileId: 'cp-1',
      });
      expect(result).toBeInstanceOf(CompanyResponseDto);
      expect(result).toMatchObject({ id: 'new-co', name: 'Acme LLC', slug: 'acme-llc' });
    });

    it('should resolve slug collision', async () => {
      const dto: CreateCompanyDto = { name: 'Test' };
      mockCompaniesRepository.findUserForCreate.mockResolvedValue({
        ...clientUserForCreate,
        clientProfile: null,
      });
      mockCompaniesRepository.isSlugTaken.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockCompaniesRepository.createWithMembership.mockResolvedValue({
        id: 'new-co',
        name: 'Test',
        slug: 'test-1',
      });

      await service.create(userId, dto);

      expect(mockCompaniesRepository.createWithMembership).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'test-1' }),
      );
    });

    it('should throw NotFoundException when user missing', async () => {
      mockCompaniesRepository.findUserForCreate.mockResolvedValue(null);

      await expect(service.create(userId, { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockCompaniesRepository.createWithMembership).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for freelancer', async () => {
      mockCompaniesRepository.findUserForCreate.mockResolvedValue(freelancerUserForCreate);

      await expect(service.create(userId, { name: 'X' })).rejects.toThrow(ForbiddenException);
      expect(mockCompaniesRepository.createWithMembership).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException without client role', async () => {
      mockCompaniesRepository.findUserForCreate.mockResolvedValue(userWithoutClientRole);

      await expect(service.create(userId, { name: 'X' })).rejects.toThrow(ForbiddenException);
      expect(mockCompaniesRepository.createWithMembership).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return current company when name omitted', async () => {
      const ability = buildUpdateAbilityForCompany(companyId);
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      const result = await service.update(companyId, userId, ability, {} as UpdateCompanyDto);

      expect(mockCompaniesRepository.update).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(CompanyResponseDto);
      expect(result).toMatchObject({ id: companyId, name: 'Acme' });
    });

    it('should update name and slug when name provided', async () => {
      const ability = buildUpdateAbilityForCompany(companyId);
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });
      mockCompaniesRepository.isSlugTaken.mockResolvedValue(false);
      mockCompaniesRepository.update.mockResolvedValue({
        ...companyRow,
        name: 'New Co',
        slug: 'new-co',
      });

      const result = await service.update(companyId, userId, ability, { name: 'New Co' });

      expect(mockCompaniesRepository.update).toHaveBeenCalledWith(companyId, {
        name: 'New Co',
        slug: 'new-co',
      });
      expect(result).toMatchObject({ name: 'New Co', slug: 'new-co' });
    });

    it('should throw NotFoundException when not a member', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue(null);

      await expect(
        service.update(companyId, userId, buildUpdateAbilityForCompany(companyId), {
          name: 'X',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockCompaniesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when ability denies update', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      await expect(
        service.update(companyId, userId, buildEmptyAbility(), { name: 'X' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockCompaniesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when ability scoped to another company', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      await expect(
        service.update(companyId, userId, buildUpdateAbilityForOtherCompany(), {
          name: 'X',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when trimmed name too short', async () => {
      const ability = buildUpdateAbilityForCompany(companyId);
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      await expect(service.update(companyId, userId, ability, { name: ' a ' })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCompaniesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete when member and ability allows', async () => {
      const ability = buildDeleteAbilityForCompany(companyId);
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });
      mockCompaniesRepository.deleteById.mockResolvedValue(undefined);

      await service.delete(companyId, userId, ability);

      expect(mockCompaniesRepository.deleteById).toHaveBeenCalledWith(companyId);
    });

    it('should throw NotFoundException when not a member', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue(null);

      await expect(
        service.delete(companyId, userId, buildDeleteAbilityForCompany(companyId)),
      ).rejects.toThrow(NotFoundException);
      expect(mockCompaniesRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when ability denies delete', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      await expect(service.delete(companyId, userId, buildEmptyAbility())).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockCompaniesRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when ability scoped to another company', async () => {
      mockCompaniesRepository.findOneWhereMember.mockResolvedValue({ ...companyRow });

      await expect(
        service.delete(companyId, userId, buildDeleteAbilityForOtherCompany()),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
