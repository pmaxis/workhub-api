import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from '@/modules/auth/service/auth.service';
import { UsersService } from '@/modules/users/service/users.service';
import { UserPermissionsRepository } from '@/modules/users/repository/user-permissions.repository';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { TokensService } from '@/infrastructure/tokens/tokens.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { comparePassword } from '@/common/utils/hash.util';

jest.mock('@/common/utils/hash.util', () => ({
  comparePassword: jest.fn().mockResolvedValue(true),
}));

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('7d'),
};

const mockUsersService = {
  findForAuth: jest.fn(),
  create: jest.fn(),
};

const mockUserPermissionsRepository = {
  getPermissionKeysByUserId: jest.fn().mockResolvedValue([]),
};

const mockSessionsService = {
  create: jest.fn(),
  findOneByToken: jest.fn(),
  findOne: jest.fn(),
  updateRefreshToken: jest.fn(),
  delete: jest.fn(),
};

const mockTokensService = {
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  generateAccessToken: jest.fn().mockReturnValue('access-token'),
  verifyRefreshToken: jest.fn(),
  hashToken: jest.fn().mockReturnValue('hashed-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserPermissionsRepository, useValue: mockUserPermissionsRepository },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: TokensService, useValue: mockTokensService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'password123',
    };
    const ip = '127.0.0.1';
    const userAgent = 'test-agent';
    const user = { id: 'user-1', email: loginDto.email, password: 'hash' };

    it('should return access and refresh tokens on valid credentials', async () => {
      mockUsersService.findForAuth.mockResolvedValue(user);
      mockSessionsService.create.mockResolvedValue({ id: 'session-1', userId: user.id });

      const result = await service.login(loginDto, ip, userAgent);

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(mockUsersService.findForAuth).toHaveBeenCalledWith(loginDto.email);
      expect(mockSessionsService.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findForAuth.mockResolvedValue(null);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findForAuth.mockResolvedValue(user);
      jest.mocked(comparePassword).mockResolvedValueOnce(false);

      await expect(service.login(loginDto, ip, userAgent)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };
    const ip = '127.0.0.1';
    const userAgent = 'test-agent';
    const createdUser = { id: 'user-1', ...registerDto };

    it('should create user and return tokens', async () => {
      mockUsersService.findForAuth.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(createdUser);
      mockSessionsService.create.mockResolvedValue({ id: 'session-1', userId: createdUser.id });

      const result = await service.register(registerDto, ip, userAgent);

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(mockUsersService.findForAuth).toHaveBeenCalledWith(registerDto.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockUsersService.findForAuth.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto, ip, userAgent)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(registerDto, ip, userAgent)).rejects.toThrow(
        'Registration failed',
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const validSession = {
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 86400000),
    };

    it('should return new tokens when session is valid', async () => {
      mockTokensService.verifyRefreshToken.mockReturnValue({ userId: 'user-1' });
      mockSessionsService.findOneByToken.mockResolvedValue(validSession);
      mockSessionsService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('valid-refresh-token');

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(mockSessionsService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockTokensService.verifyRefreshToken.mockReturnValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('invalid-token')).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException when session not found', async () => {
      mockTokensService.verifyRefreshToken.mockReturnValue({ userId: 'user-1' });
      mockSessionsService.findOneByToken.mockResolvedValue(null);

      await expect(service.refresh('token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('token')).rejects.toThrow('Invalid session');
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      mockTokensService.verifyRefreshToken.mockReturnValue({ userId: 'user-1' });
      mockSessionsService.findOneByToken.mockResolvedValue({
        ...validSession,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('token')).rejects.toThrow('Invalid session');
    });
  });

  describe('logout', () => {
    it('should call sessionsService.delete with sessionId', async () => {
      mockSessionsService.delete.mockResolvedValue(undefined);

      await service.logout('session-1');

      expect(mockSessionsService.delete).toHaveBeenCalledWith('session-1');
    });
  });
});
