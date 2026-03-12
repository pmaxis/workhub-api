import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import type { StringValue } from 'ms';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue;
  private readonly refreshExpiresIn: StringValue;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessSecret = this.config.getOrThrow<string>('tokens.accessToken.secret');
    this.refreshSecret = this.config.getOrThrow<string>('tokens.refreshToken.secret');
    this.accessExpiresIn = this.config.getOrThrow<StringValue>('tokens.accessToken.expiresIn');
    this.refreshExpiresIn = this.config.getOrThrow<StringValue>('tokens.refreshToken.expiresIn');
  }

  generateAccessToken(userId: string, sessionId: string, permissions: string[]): string {
    return this.jwtService.sign(
      { userId, sessionId, permissions },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    );
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      },
    );
  }

  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = this.jwtService.verify<{ userId: string }>(token, {
        secret: this.refreshSecret,
      });
      return payload?.userId ? { userId: payload.userId } : null;
    } catch (error) {
      this.logger.warn('Invalid refresh token', error instanceof Error ? error.stack : undefined);
      return null;
    }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
