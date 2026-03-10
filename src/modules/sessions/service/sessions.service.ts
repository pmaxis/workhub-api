import { Injectable } from '@nestjs/common';
import { SessionsRepository } from '@/modules/sessions/repository/sessions.repository';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  create(createSessionDto: CreateSessionDto) {
    return this.sessionsRepository.create(createSessionDto);
  }

  findAll() {
    return this.sessionsRepository.findAll();
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

  delete(id: string) {
    return this.sessionsRepository.delete(id);
  }
}
