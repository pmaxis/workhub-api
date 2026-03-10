import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from '@/modules/auth/controller/auth.controller';
import { AuthService } from '@/modules/auth/service/auth.service';
import { CookieService } from '@/infrastructure/cookie/cookie.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

const mockCookieService = {
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let res: Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    res = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CookieService, useValue: mockCookieService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return accessToken and set refresh cookie', async () => {
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test' },
      } as unknown as Request;
      const loginDto: LoginDto = { email: 'a@b.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.login(loginDto, req, res);

      expect(result).toEqual({ accessToken: 'access' });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, '127.0.0.1', 'test');
      expect(mockCookieService.setAuthCookies).toHaveBeenCalledWith(res, 'refresh');
    });
  });

  describe('register', () => {
    it('should return accessToken and set refresh cookie', async () => {
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test' },
      } as unknown as Request;
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockAuthService.register.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.register(registerDto, req, res);

      expect(result).toEqual({ accessToken: 'access' });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto, '127.0.0.1', 'test');
      expect(mockCookieService.setAuthCookies).toHaveBeenCalledWith(res, 'refresh');
    });
  });

  describe('refresh', () => {
    it('should return accessToken when refresh cookie is present', async () => {
      const req = {
        signedCookies: { refresh_token: 'token' },
      } as unknown as Request;
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const result = await controller.refresh(req, res);

      expect(result).toEqual({ accessToken: 'new-access' });
      expect(mockAuthService.refresh).toHaveBeenCalledWith('token');
      expect(mockCookieService.setAuthCookies).toHaveBeenCalledWith(res, 'new-refresh');
    });

    it('should throw UnauthorizedException when refresh cookie is missing', async () => {
      const req = { signedCookies: {} } as unknown as Request;

      await expect(controller.refresh(req, res)).rejects.toThrow(UnauthorizedException);
      await expect(controller.refresh(req, res)).rejects.toThrow('Refresh token required');
      expect(mockAuthService.refresh).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call logout and clear cookies', async () => {
      const req = { user: { sessionId: 'session-1' } };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req, res);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockAuthService.logout).toHaveBeenCalledWith('session-1');
      expect(mockCookieService.clearAuthCookies).toHaveBeenCalledWith(res);
    });
  });
});
