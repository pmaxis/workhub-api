import { Controller, Post, Req, Res, Body, UnauthorizedException } from '@nestjs/common';
import { CookieService } from '@/infrastructure/cookie/cookie.service';
import type { Request, Response } from 'express';
import { AuthService } from '@/modules/auth/service/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
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
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.signedCookies?.refresh_token as string;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const tokens = await this.authService.refresh(refreshToken);

    this.cookieService.setAuthCookies(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(
    @Req() req: { user: { sessionId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sessionId);
    this.cookieService.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }
}
