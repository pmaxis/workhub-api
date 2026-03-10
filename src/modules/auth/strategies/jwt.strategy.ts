import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionsService } from '@/modules/sessions/service/sessions.service';

type JwtPayload = { userId: string; sessionId: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {
    const secret = config.getOrThrow<string>('tokens.accessToken.secret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.sessionsService.findOne(payload.sessionId);

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
    };
  }
}
