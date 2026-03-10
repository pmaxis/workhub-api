import ms from 'ms';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { comparePassword } from '@/common/utils/hash.util';
import { TokensService } from '@/infrastructure/tokens/tokens.service';
import { UsersService } from '@/modules/users/service/users.service';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@Injectable()
export class AuthService {
  private readonly refreshTokenMaxAge: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly tokensService: TokensService,
  ) {
    this.refreshTokenMaxAge = ms(
      this.configService.getOrThrow<ms.StringValue>('tokens.refreshToken.expiresIn'),
    );
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthSession(user.id, ipAddress, userAgent);
  }

  async register(registerDto: RegisterDto, ipAddress: string, userAgent: string) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Registration failed');
    }

    const user = await this.usersService.create(registerDto);

    return this.createAuthSession(user.id, ipAddress, userAgent);
  }

  async refresh(token: string) {
    const payload = this.tokensService.verifyRefreshToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.tokensService.hashToken(token);
    const session = await this.sessionsService.findOneByToken(tokenHash);

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid session');
    }

    const accessToken = this.tokensService.generateAccessToken(session.userId, session.id);
    const refreshToken = this.tokensService.generateRefreshToken(session.userId);
    const refreshTokenHash = this.tokensService.hashToken(refreshToken);

    await this.sessionsService.updateRefreshToken(
      session.id,
      refreshTokenHash,
      new Date(Date.now() + this.refreshTokenMaxAge),
    );

    return { accessToken, refreshToken };
  }

  async logout(sessionId: string) {
    await this.sessionsService.delete(sessionId);
  }

  private async createAuthSession(userId: string, ipAddress: string, userAgent: string) {
    const refreshToken = this.tokensService.generateRefreshToken(userId);
    const refreshTokenHash = this.tokensService.hashToken(refreshToken);

    const session = await this.sessionsService.create({
      userId,
      refreshToken: refreshTokenHash,
      expiresAt: new Date(Date.now() + this.refreshTokenMaxAge),
      ipAddress,
      userAgent,
    });

    const accessToken = this.tokensService.generateAccessToken(userId, session.id);

    return { accessToken, refreshToken };
  }
}
