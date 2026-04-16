import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { SessionsRepository } from '@/modules/sessions/repository/sessions.repository';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly adminAuditLogWriter: AdminAuditLogWriterService,
  ) {}

  create(createSessionDto: CreateSessionDto) {
    return this.sessionsRepository.create(createSessionDto);
  }

  findAllForUser(userId: string) {
    return this.sessionsRepository.findAllForUser(userId);
  }

  findOne(id: string) {
    return this.sessionsRepository.findOne(id);
  }

  findOneByToken(tokenHash: string) {
    return this.sessionsRepository.findOneByToken(tokenHash);
  }

  updateRefreshToken(id: string, refreshToken: string, expiresAt: Date) {
    return this.sessionsRepository.updateRefreshToken(id, refreshToken, expiresAt);
  }

  async deleteForUser(id: string, userId: string): Promise<void> {
    const { count } = await this.sessionsRepository.deleteForUser(id, userId);
    if (count === 0) {
      throw new NotFoundException('Session not found');
    }

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'sessions',
      message: 'Session revoked',
      actorUserId: userId,
      context: { sessionId: id },
    });
  }
}
