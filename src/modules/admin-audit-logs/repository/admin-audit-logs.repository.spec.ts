import { Test, TestingModule } from '@nestjs/testing';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';

type AdminAuditLogDelegateMock = {
  create: jest.MockedFunction<(args: Prisma.AdminAuditLogCreateArgs) => Promise<void>>;
  findMany: jest.MockedFunction<(args: Prisma.AdminAuditLogFindManyArgs) => Promise<PrismaRow[]>>;
  count: jest.MockedFunction<(args: Prisma.AdminAuditLogCountArgs) => Promise<number>>;
};

type PrismaRow = Prisma.AdminAuditLogGetPayload<{
  include: { actor: { select: { id: true; email: true; firstName: true; lastName: true } } };
}>;

function createDatabaseStub(
  delegate: AdminAuditLogDelegateMock,
): Pick<DatabaseService, 'adminAuditLog'> {
  return { adminAuditLog: delegate };
}

describe('AdminAuditLogsRepository', () => {
  let repository: AdminAuditLogsRepository;
  let delegate: AdminAuditLogDelegateMock;

  beforeEach(async () => {
    jest.clearAllMocks();
    delegate = {
      create: jest.fn((_args: Prisma.AdminAuditLogCreateArgs) => Promise.resolve()),
      findMany: jest.fn((_args: Prisma.AdminAuditLogFindManyArgs) =>
        Promise.resolve<PrismaRow[]>([]),
      ),
      count: jest.fn((_args: Prisma.AdminAuditLogCountArgs) => Promise.resolve(0)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditLogsRepository,
        { provide: DatabaseService, useValue: createDatabaseStub(delegate) },
      ],
    }).compile();

    repository = module.get(AdminAuditLogsRepository);
  });

  describe('create', () => {
    it('writes row with optional fields omitted when undefined', async () => {
      await repository.create({
        level: AdminAuditLogLevel.INFO,
        source: 'auth',
        message: 'ok',
      });

      expect(delegate.create).toHaveBeenCalledWith({
        data: {
          level: AdminAuditLogLevel.INFO,
          source: 'auth',
          message: 'ok',
          context: undefined,
          actorUserId: undefined,
        },
      });
    });

    it('passes context and actorUserId when set', async () => {
      await repository.create({
        level: AdminAuditLogLevel.ERROR,
        source: 'jobs',
        message: 'failed',
        context: { jobId: 'j1' },
        actorUserId: 'u1',
      });

      expect(delegate.create).toHaveBeenCalledWith({
        data: {
          level: AdminAuditLogLevel.ERROR,
          source: 'jobs',
          message: 'failed',
          context: { jobId: 'j1' },
          actorUserId: 'u1',
        },
      });
    });
  });

  describe('findPage', () => {
    it('queries with pagination and empty where when no filters', async () => {
      delegate.findMany.mockResolvedValue([]);
      delegate.count.mockResolvedValue(0);

      const result = await repository.findPage({ page: 2, limit: 15 });

      expect(delegate.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 15,
        take: 15,
        include: {
          actor: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      });
      expect(delegate.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('adds level and case-insensitive source filter', async () => {
      const row: PrismaRow = {
        id: 'id-1',
        level: AdminAuditLogLevel.WARN,
        source: 'AuthService',
        message: 'm',
        context: null,
        actorUserId: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        actor: null,
      };
      delegate.findMany.mockResolvedValue([row]);
      delegate.count.mockResolvedValue(1);

      const result = await repository.findPage({
        page: 1,
        limit: 20,
        level: AdminAuditLogLevel.WARN,
        source: 'auth',
      });

      const expectedWhere: Prisma.AdminAuditLogWhereInput = {
        level: AdminAuditLogLevel.WARN,
        source: { contains: 'auth', mode: 'insensitive' },
      };

      expect(delegate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
          skip: 0,
          take: 20,
        }),
      );
      expect(delegate.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: 'id-1',
        level: AdminAuditLogLevel.WARN,
        source: 'AuthService',
        message: 'm',
        context: null,
        createdAt: row.createdAt,
        actor: null,
      });
    });
  });
});
