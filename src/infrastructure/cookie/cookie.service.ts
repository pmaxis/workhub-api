import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Injectable()
export class CookieService {
  private readonly path: string;
  private readonly maxAge: number;
  private readonly isProduction: boolean;

  constructor(private readonly config: ConfigService) {
    this.path = this.config.getOrThrow<string>('cookie.path');
    this.maxAge = this.config.getOrThrow<number>('cookie.maxAge');
    this.isProduction = this.config.getOrThrow<string>('app.env') === 'production';
  }

  private get secure(): boolean {
    return this.config.get<boolean>('cookie.secure') ?? this.isProduction;
  }

  setAuthCookies(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: this.path,
      maxAge: this.maxAge,
      signed: true,
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: this.path,
    });
  }
}
