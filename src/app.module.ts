import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '@/common/config/config';
import { validationSchema } from '@/common/config/validation';
import { DatabaseModule } from '@/infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: validationSchema,
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
