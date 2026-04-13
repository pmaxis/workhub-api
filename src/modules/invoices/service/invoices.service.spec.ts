jest.mock('@/infrastructure/database/generated/client', () => {
  const PrismaClientKnownRequestError = class extends Error {
    code = '';
    constructor(message: string, opts?: { code?: string }) {
      super(message);
      this.code = opts?.code ?? '';
    }
  };
  const Decimal = class {
    constructor(public v: unknown) {}
  };
  return {
    Prisma: { Decimal, PrismaClientKnownRequestError },
  };
});

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { InvoicesRepository } from '@/modules/invoices/repository/invoices.repository';
import { InvoicesService } from '@/modules/invoices/service/invoices.service';

const userId = 'user-1';

const mappedInvoice = {
  id: 'inv-1',
  userId,
  projectId: null as string | null,
  number: 'INV-2026-0001',
  title: 'Acme',
  amount: { toFixed: (n: number) => Number(100.5).toFixed(n) },
  currency: 'USD',
  status: InvoiceStatus.DRAFT,
  issuedAt: null as Date | null,
  dueAt: null as Date | null,
  notes: null as string | null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockInvoicesRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByUserId: jest.fn(),
  existsByUserIdAndNumber: jest.fn(),
};

const mockProjectsRepo = {
  findOne: jest.fn(),
};

function buildAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Create, 'Invoice');
  can(Action.Read, 'Invoice', { userId: id });
  can(Action.Update, 'Invoice', { userId: id });
  can(Action.Delete, 'Invoice', { userId: id });
  return build();
}

function buildInvoiceReadOnlyAbility(id: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Invoice', { userId: id });
  return build();
}

describe('InvoicesService', () => {
  let service: InvoicesService;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildAbility(userId);
    mockInvoicesRepo.existsByUserIdAndNumber.mockResolvedValue(false);
    mockInvoicesRepo.countByUserId.mockResolvedValue(0);
    mockInvoicesRepo.create.mockResolvedValue(mappedInvoice);
    mockInvoicesRepo.findOne.mockResolvedValue(mappedInvoice);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: InvoicesRepository, useValue: mockInvoicesRepo },
        { provide: ProjectsRepository, useValue: mockProjectsRepo },
      ],
    }).compile();

    service = module.get(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create persists invoice', async () => {
    const dto = { amount: 100.5, currency: 'usd' };
    const result = await service.create(userId, ability, dto);
    expect(mockInvoicesRepo.create).toHaveBeenCalled();
    expect(result.number).toBe(mappedInvoice.number);
    expect(result.amount).toBe('100.50');
  });

  it('findOne throws when missing', async () => {
    mockInvoicesRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('missing', ability)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create throws when project not found', async () => {
    mockProjectsRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create(userId, ability, { amount: 1, projectId: 'p-missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mockInvoicesRepo.create).not.toHaveBeenCalled();
  });

  it('findAll maps rows to response DTOs', async () => {
    mockInvoicesRepo.findAll.mockResolvedValueOnce({
      data: [mappedInvoice],
      total: 1,
      page: 1,
      limit: 20,
    });
    const res = await service.findAll(ability, {});
    expect(res.total).toBe(1);
    expect(res.data[0].amount).toBe('100.50');
  });

  it('update returns existing when dto is empty', async () => {
    const res = await service.update('inv-1', ability, {});
    expect(mockInvoicesRepo.update).not.toHaveBeenCalled();
    expect(res.id).toBe(mappedInvoice.id);
  });

  it('update throws when invoice not found', async () => {
    mockInvoicesRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.update('x', ability, { title: 'a' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update throws when policy forbids update', async () => {
    const readOnly = buildInvoiceReadOnlyAbility(userId);
    await expect(service.update('inv-1', readOnly, { title: 'nope' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('delete calls repository', async () => {
    await service.delete('inv-1', ability);
    expect(mockInvoicesRepo.delete).toHaveBeenCalledWith('inv-1');
  });
});
