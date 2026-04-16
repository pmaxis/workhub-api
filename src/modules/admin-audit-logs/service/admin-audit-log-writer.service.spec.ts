import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';

const mockRepository: {
  create: jest.MockedFunction<AdminAuditLogsRepository['create']>;
} = {
  create: jest.fn(),
};

async function flushBackgroundTasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}

describe('AdminAuditLogWriterService', () => {
  let service: AdminAuditLogWriterService;
  let warnSpy: ReturnType<typeof jest.spyOn<Logger, 'warn'>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepository.create.mockResolvedValue(undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditLogWriterService,
        { provide: AdminAuditLogsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(AdminAuditLogWriterService);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('enqueue persists via repository.create', async () => {
    service.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'auth',
      message: 'Signed in',
      context: { ipAddress: '127.0.0.1' },
      actorUserId: 'user-42',
    });

    await flushBackgroundTasks();

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.create).toHaveBeenCalledWith({
      level: AdminAuditLogLevel.INFO,
      source: 'auth',
      message: 'Signed in',
      context: { ipAddress: '127.0.0.1' },
      actorUserId: 'user-42',
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('enqueue normalizes null context and actor', async () => {
    service.enqueue({
      level: AdminAuditLogLevel.ERROR,
      source: 'payments',
      message: 'Webhook failed',
      context: null,
      actorUserId: null,
    });

    await flushBackgroundTasks();

    expect(mockRepository.create).toHaveBeenCalledWith({
      level: AdminAuditLogLevel.ERROR,
      source: 'payments',
      message: 'Webhook failed',
      context: null,
      actorUserId: null,
    });
  });

  it('enqueue swallows repository errors and logs a warning', async () => {
    mockRepository.create.mockRejectedValue(new Error('db down'));

    service.enqueue({
      level: AdminAuditLogLevel.DEBUG,
      source: 'test',
      message: 'noop',
    });

    await flushBackgroundTasks();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('test');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('db down');
  });
});
