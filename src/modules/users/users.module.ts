import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { UsersService } from '@/modules/users/service/users.service';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { UsersController } from '@/modules/users/controller/users.controller';
import { UserRolesController } from '@/modules/users/controller/user-roles.controller';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, UserRolesController],
  providers: [UsersService, UserRolesService, UsersRepository, UserRolesRepository],
  exports: [UsersService, UserRolesService],
})
export class UsersModule {}
