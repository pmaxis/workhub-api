import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserContextRepository } from '@/modules/users/repository/user-context.repository';
import { RequestUser } from '@/common/ability/ability.types';

type JwtPayload = { userId: string; sessionId: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly userContextRepository: UserContextRepository,
  ) {
    const secret = config.getOrThrow<string>('tokens.accessToken.secret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const context = await this.userContextRepository.loadContext(payload.userId, payload.sessionId);

    if (!context) {
      throw new UnauthorizedException('User not found');
    }

    return context;
  }
}
