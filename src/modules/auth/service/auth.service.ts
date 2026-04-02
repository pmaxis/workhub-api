import ms from 'ms';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { comparePassword } from '@/common/utils/hash.util';
import { TokensService } from '@/infrastructure/tokens/tokens.service';
import { UsersService } from '@/modules/users/service/users.service';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';
import { UserOnboardingService } from '@/modules/users/service/user-onboarding.service';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@Injectable()
export class AuthService {
  private readonly refreshTokenMaxAge: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly userOnboardingService: UserOnboardingService,
    private readonly sessionsService: SessionsService,
    private readonly tokensService: TokensService,
    private readonly invitationsService: InvitationsService,
  ) {
    this.refreshTokenMaxAge = ms(
      this.configService.getOrThrow<ms.StringValue>('tokens.refreshToken.expiresIn'),
    );
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.usersService.findForAuth(loginDto.email);
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
    const existingUser = await this.usersService.findForAuth(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Registration failed');
    }

    let invitationContext: { invitationId: string; invitedById: string } | null = null;

    if (registerDto.invitationToken) {
      const invitation = await this.invitationsService.getInvitationForRegistration(
        registerDto.invitationToken,
      );

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation');
      }

      if (invitation.email.toLowerCase() !== registerDto.email.toLowerCase()) {
        throw new BadRequestException('Email must match the invited address');
      }

      invitationContext = { invitationId: invitation.id, invitedById: invitation.invitedById };
    }

    const { invitationToken: _, ...createUserDto } = registerDto;

    const user: UserResponseDto = await this.usersService.create({
      ...createUserDto,
      isActivated: !!invitationContext,
    });

    const userId = user.id;

    if (invitationContext) {
      await this.invitationsService.accept(invitationContext.invitationId);
      await this.userOnboardingService.registerClientFromInvitation(
        userId,
        invitationContext.invitedById,
      );
    } else {
      await this.userOnboardingService.ensureFreelancerProfile(userId);
    }

    return this.createAuthSession(userId, ipAddress, userAgent);
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

    const userId = session.userId;
    const sessionId = session.id;

    const accessToken = this.tokensService.generateAccessToken(userId, sessionId);

    const refreshToken = this.tokensService.generateRefreshToken(userId);
    const refreshTokenHash = this.tokensService.hashToken(refreshToken);

    await this.sessionsService.updateRefreshToken(
      sessionId,
      refreshTokenHash,
      new Date(Date.now() + this.refreshTokenMaxAge),
    );

    return { accessToken, refreshToken };
  }

  async logout(sessionId: string, userId: string) {
    await this.sessionsService.deleteForUser(sessionId, userId);
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

    const sessionId = session.id;
    const accessToken = this.tokensService.generateAccessToken(userId, sessionId);

    return { accessToken, refreshToken };
  }
}
