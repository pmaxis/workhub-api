import { Controller, Post, Req, Res, Body, UnauthorizedException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CookieService } from '@/infrastructure/cookie/cookie.service';
import type { Request, Response } from 'express';
import { RequestUser } from '@/common/ability/ability.types';
import { AuthService } from '@/modules/auth/service/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { AccessTokenResponseDto } from '@/modules/auth/dto/access-token-response.dto';
import { LogoutResponseDto } from '@/modules/auth/dto/logout-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  @ApiOperation({ summary: 'Sign in' })
  @ApiOkResponse({
    type: AccessTokenResponseDto,
    description: 'Sets httpOnly refresh cookie; returns access token',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;

    const { accessToken, refreshToken } = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent,
    );

    this.cookieService.setAuthCookies(res, refreshToken);

    return { accessToken };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiOkResponse({
    type: AccessTokenResponseDto,
    description: 'Sets httpOnly refresh cookie; returns access token',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;

    const { accessToken, refreshToken } = await this.authService.register(
      registerDto,
      ipAddress,
      userAgent,
    );

    this.cookieService.setAuthCookies(res, refreshToken);

    return { accessToken };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
  @ApiOkResponse({ type: AccessTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.cookieService.getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const tokens = await this.authService.refresh(refreshToken);

    this.cookieService.setAuthCookies(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out current session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(@Req() req: { user: RequestUser }, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sessionId, req.user.userId);
    this.cookieService.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }
}
