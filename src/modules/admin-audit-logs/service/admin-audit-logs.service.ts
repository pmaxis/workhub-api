import { Injectable } from '@nestjs/common';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';
import { QueryAdminAuditLogsDto } from '@/modules/admin-audit-logs/dto/query-admin-audit-logs.dto';
import { PaginatedAdminAuditLogsResponseDto } from '@/modules/admin-audit-logs/dto/paginated-admin-audit-logs-response.dto';
import { AdminAuditLogResponseDto } from '@/modules/admin-audit-logs/dto/admin-audit-log-response.dto';
import type { Prisma } from '@/infrastructure/database/generated/client';

@Injectable()
export class AdminAuditLogsService {
  constructor(private readonly repository: AdminAuditLogsRepository) {}

  async findPage(query: QueryAdminAuditLogsDto): Promise<PaginatedAdminAuditLogsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const { data, total } = await this.repository.findPage({
      page,
      limit,
      level: query.level,
      source: query.source,
    });

    return {
      data: data.map((row) => this.mapRow(row)),
      total,
      page,
      limit,
    };
  }

  private mapRow(row: {
    id: string;
    level: AdminAuditLogResponseDto['level'];
    source: string;
    message: string;
    context: Prisma.JsonValue | null;
    createdAt: Date;
    actor: { id: string; email: string; firstName: string; lastName: string } | null;
  }): AdminAuditLogResponseDto {
    return {
      id: row.id,
      level: row.level,
      source: row.source,
      message: row.message,
      context:
        row.context === null || row.context === undefined
          ? null
          : (row.context as Record<string, unknown>),
      createdAt: row.createdAt,
      actor: row.actor
        ? {
            id: row.actor.id,
            email: row.actor.email,
            firstName: row.actor.firstName,
            lastName: row.actor.lastName,
          }
        : null,
    };
  }
}
