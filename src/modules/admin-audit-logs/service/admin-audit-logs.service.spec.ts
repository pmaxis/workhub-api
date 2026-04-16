import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import type { AdminAuditLogRow } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';
import { AdminAuditLogsService } from '@/modules/admin-audit-logs/service/admin-audit-logs.service';
import { QueryAdminAuditLogsDto } from '@/modules/admin-audit-logs/dto/query-admin-audit-logs.dto';

const mockRepository: {
  findPage: jest.MockedFunction<AdminAuditLogsRepository['findPage']>;
} = {
  findPage: jest.fn(),
};

describe('AdminAuditLogsService', () => {
  let service: AdminAuditLogsService;

  const baseRow: AdminAuditLogRow = {
    id: 'log-1',
    level: AdminAuditLogLevel.WARN,
    source: 'billing',
    message: 'Threshold reached',
    context: { amount: 100 },
    createdAt: new Date('2026-04-16T10:00:00.000Z'),
    actor: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepository.findPage.mockResolvedValue({ data: [baseRow], total: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditLogsService,
        { provide: AdminAuditLogsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(AdminAuditLogsService);
  });

  it('uses default page and limit when omitted', async () => {
    const query = new QueryAdminAuditLogsDto();
    const result = await service.findPage(query);

    expect(mockRepository.findPage).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      level: undefined,
      source: undefined,
    });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.id).toBe('log-1');
    expect(result.data[0]?.context).toEqual({ amount: 100 });
  });

  it('passes filters and maps actor', async () => {
    const rowWithActor: AdminAuditLogRow = {
      ...baseRow,
      id: 'log-2',
      actor: {
        id: 'u-9',
        email: 'actor@test.com',
        firstName: 'Ann',
        lastName: 'Lee',
      },
    };
    mockRepository.findPage.mockResolvedValue({ data: [rowWithActor], total: 40 });

    const query = new QueryAdminAuditLogsDto();
    query.page = 3;
    query.limit = 10;
    query.level = AdminAuditLogLevel.INFO;
    query.source = 'auth';

    const result = await service.findPage(query);

    expect(mockRepository.findPage).toHaveBeenCalledWith({
      page: 3,
      limit: 10,
      level: AdminAuditLogLevel.INFO,
      source: 'auth',
    });
    expect(result.data[0]?.actor).toEqual({
      id: 'u-9',
      email: 'actor@test.com',
      firstName: 'Ann',
      lastName: 'Lee',
    });
  });

  it('maps null context to null', async () => {
    const rowNoContext: AdminAuditLogRow = { ...baseRow, context: null };
    mockRepository.findPage.mockResolvedValue({ data: [rowNoContext], total: 1 });

    const result = await service.findPage(new QueryAdminAuditLogsDto());

    expect(result.data[0]?.context).toBeNull();
  });
});
