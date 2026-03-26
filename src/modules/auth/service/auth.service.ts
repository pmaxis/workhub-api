import ms from 'ms';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientStatus } from '@/infrastructure/database/generated/enums';
import { comparePassword } from '@/common/utils/hash.util';
import { TokensService } from '@/infrastructure/tokens/tokens.service';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CLIENT_ROLE_SLUG } from '@/common/constants/reserved';
import { UsersService } from '@/modules/users/service/users.service';
import { UserPermissionsRepository } from '@/modules/users/repository/user-permissions.repository';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@Injectable()
export class AuthService {
  private readonly refreshTokenMaxAge: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly userPermissionsRepository: UserPermissionsRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly sessionsService: SessionsService,
    private readonly tokensService: TokensService,
    private readonly invitationsService: InvitationsService,
    private readonly rolesRepository: RolesRepository,
    private readonly database: DatabaseService,
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

    let isActivated = false;
    let invitationId: string | null = null;
    let invitedById: string | null = null;

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
      isActivated = true;
      invitationId = invitation.id;
      invitedById = invitation.invitedById;
    }

    const { invitationToken: _, ...createUserDto } = registerDto;
    const user = await this.usersService.create({
      ...createUserDto,
      isActivated,
    });

    if (invitationId && invitedById) {
      await this.invitationsService.accept(invitationId);

      const clientRole = await this.rolesRepository.findBySlug(CLIENT_ROLE_SLUG);
      if (clientRole) {
        await this.userRolesRepository.addRole({
          userId: user.id,
          roleId: clientRole.id,
        });
      }

      const clientProfile = await this.database.clientProfile.create({
        data: { userId: user.id },
      });

      const freelancerProfile = await this.database.freelancerProfile.findUnique({
        where: { userId: invitedById },
      });
      if (freelancerProfile) {
        await this.database.clientRelation.create({
          data: {
            freelancerProfileId: freelancerProfile.id,
            clientProfileId: clientProfile.id,
            status: ClientStatus.ACTIVE,
          },
        });
      }
    } else {
      await this.database.freelancerProfile.create({
        data: { userId: user.id },
      });
    }

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

    const userId = String(session.userId);
    const sessionId = String(session.id);

    const permissions = await this.userPermissionsRepository.getPermissionKeysByUserId(userId);

    const accessToken = this.tokensService.generateAccessToken(userId, sessionId, permissions);

    const refreshToken = this.tokensService.generateRefreshToken(userId);
    const refreshTokenHash = this.tokensService.hashToken(refreshToken);

    await this.sessionsService.updateRefreshToken(
      sessionId,
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

    const sessionId = String(session.id);

    const permissions = await this.userPermissionsRepository.getPermissionKeysByUserId(userId);
    const accessToken = this.tokensService.generateAccessToken(userId, sessionId, permissions);

    return { accessToken, refreshToken };
  }
}
