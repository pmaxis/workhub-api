import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { UsersService } from '@/modules/users/service/users.service';
import { UsersController } from '@/modules/users/controller/users.controller';
import { UsersRepository } from '@/modules/users/repository/users.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
