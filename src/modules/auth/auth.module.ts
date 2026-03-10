import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokensModule } from '@/infrastructure/tokens/tokens.module';
import { CookieModule } from '@/infrastructure/cookie/cookie.module';
import { AuthService } from '@/modules/auth/service/auth.service';
import { AuthController } from '@/modules/auth/controller/auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

@Module({
  imports: [PassportModule, TokensModule, CookieModule, UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
