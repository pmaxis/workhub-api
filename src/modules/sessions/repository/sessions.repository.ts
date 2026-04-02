import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
  }) {
    return this.database.session.create({ data });
  }

  async findAllForUser(userId: string) {
    return this.database.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.database.session.findUnique({ where: { id } });
  }

  async findOneByToken(tokenHash: string) {
    return this.database.session.findFirst({ where: { refreshToken: tokenHash } });
  }

  async updateRefreshToken(id: string, refreshToken: string, expiresAt: Date) {
    return this.database.session.update({ where: { id }, data: { refreshToken, expiresAt } });
  }

  async deleteForUser(id: string, userId: string): Promise<{ count: number }> {
    return this.database.session.deleteMany({ where: { id, userId } });
  }
}
