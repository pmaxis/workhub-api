import { Module } from '@nestjs/common';
import { TokensService } from '@/infrastructure/tokens/tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
