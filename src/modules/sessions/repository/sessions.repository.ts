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

  async findAll() {
    return this.database.session.findMany();
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

  async delete(id: string): Promise<void> {
    await this.database.session.delete({ where: { id } });
  }
}
