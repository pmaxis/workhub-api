import { Injectable } from '@nestjs/common';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';

export type AdminAuditLogRow = {
  id: string;
  level: AdminAuditLogLevel;
  source: string;
  message: string;
  context: Prisma.JsonValue | null;
  createdAt: Date;
  actor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type CreateAdminAuditLogInput = {
  level: AdminAuditLogLevel;
  source: string;
  message: string;
  context?: Prisma.InputJsonValue | null;
  actorUserId?: string | null;
};

export type FindPageAdminAuditLogsOptions = {
  page: number;
  limit: number;
  level?: AdminAuditLogLevel;
  source?: string;
};

@Injectable()
export class AdminAuditLogsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateAdminAuditLogInput): Promise<void> {
    await this.database.adminAuditLog.create({
      data: {
        level: input.level,
        source: input.source,
        message: input.message,
        context: input.context ?? undefined,
        actorUserId: input.actorUserId ?? undefined,
      },
    });
  }

  async findPage(
    options: FindPageAdminAuditLogsOptions,
  ): Promise<{ data: AdminAuditLogRow[]; total: number }> {
    const { page, limit, level, source } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.AdminAuditLogWhereInput = {};
    if (level) {
      where.level = level;
    }
    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      this.database.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      this.database.adminAuditLog.count({ where }),
    ]);

    return {
      data: rows.map((r) => ({
        id: r.id,
        level: r.level,
        source: r.source,
        message: r.message,
        context: r.context,
        createdAt: r.createdAt,
        actor: r.actor,
      })),
      total,
    };
  }
}
