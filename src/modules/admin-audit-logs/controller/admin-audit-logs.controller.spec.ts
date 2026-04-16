import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogsController } from '@/modules/admin-audit-logs/controller/admin-audit-logs.controller';
import { AdminAuditLogsService } from '@/modules/admin-audit-logs/service/admin-audit-logs.service';
import type { PaginatedAdminAuditLogsResponseDto } from '@/modules/admin-audit-logs/dto/paginated-admin-audit-logs-response.dto';

const mockAdminAuditLogsService: {
  findPage: jest.MockedFunction<AdminAuditLogsService['findPage']>;
} = {
  findPage: jest.fn(),
};

describe('AdminAuditLogsController', () => {
  let controller: AdminAuditLogsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuditLogsController],
      providers: [{ provide: AdminAuditLogsService, useValue: mockAdminAuditLogsService }],
    }).compile();

    controller = module.get(AdminAuditLogsController);
  });

  it('findAll delegates to service with query DTO', async () => {
    const payload: PaginatedAdminAuditLogsResponseDto = {
      data: [
        {
          id: 'log-1',
          level: AdminAuditLogLevel.INFO,
          source: 'auth',
          message: 'User session created',
          context: { sessionId: 's1' },
          createdAt: new Date('2026-04-16T12:00:00.000Z'),
          actor: { id: 'u1', email: 'a@test.com', firstName: 'A', lastName: 'B' },
        },
      ],
      total: 1,
      page: 2,
      limit: 25,
    };
    mockAdminAuditLogsService.findPage.mockResolvedValue(payload);

    const query = { page: 2, limit: 25, level: AdminAuditLogLevel.INFO, source: 'auth' };
    const result = await controller.findAll(query);

    expect(result).toEqual(payload);
    expect(mockAdminAuditLogsService.findPage).toHaveBeenCalledTimes(1);
    expect(mockAdminAuditLogsService.findPage).toHaveBeenCalledWith(query);
  });
});
