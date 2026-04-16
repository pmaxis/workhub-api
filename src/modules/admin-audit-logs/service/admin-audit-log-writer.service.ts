import { Injectable, Logger } from '@nestjs/common';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';

export type WriteAdminAuditLogInput = {
  level: AdminAuditLogLevel;
  source: string;
  message: string;
  context?: Prisma.InputJsonValue | null;
  actorUserId?: string | null;
};

@Injectable()
export class AdminAuditLogWriterService {
  private readonly logger = new Logger(AdminAuditLogWriterService.name);

  constructor(private readonly repository: AdminAuditLogsRepository) {}

  /** Persists in the background; failures are logged and never thrown to callers. */
  enqueue(input: WriteAdminAuditLogInput): void {
    void this.persist(input);
  }

  private async persist(input: WriteAdminAuditLogInput): Promise<void> {
    try {
      await this.repository.create({
        level: input.level,
        source: input.source,
        message: input.message,
        context: input.context ?? null,
        actorUserId: input.actorUserId ?? null,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write admin audit log (${input.source}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
