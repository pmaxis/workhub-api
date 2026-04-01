import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { UsersService } from '@/modules/users/service/users.service';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { UsersController } from '@/modules/users/controller/users.controller';
import { UserRolesController } from '@/modules/users/controller/user-roles.controller';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { UserPermissionsRepository } from '@/modules/users/repository/user-permissions.repository';
import { UserOnboardingRepository } from '@/modules/users/repository/user-onboarding.repository';
import { UserOnboardingService } from '@/modules/users/service/user-onboarding.service';
import { UserContextRepository } from '@/modules/users/repository/user-context.repository';
import { usersAbilityDefinitions } from '@/modules/users/ability/users.ability';
import { userRolesAbilityDefinitions } from '@/modules/users/ability/user-roles.ability';

@Module({
  imports: [
    DatabaseModule,
    RolesModule,
    AbilityModule.forModule([...usersAbilityDefinitions, ...userRolesAbilityDefinitions]),
  ],
  controllers: [UsersController, UserRolesController],
  providers: [
    UsersService,
    UserRolesService,
    UserOnboardingService,
    UsersRepository,
    UserRolesRepository,
    UserPermissionsRepository,
    UserOnboardingRepository,
    UserContextRepository,
  ],
  exports: [
    UsersService,
    UsersRepository,
    UserRolesService,
    UserOnboardingService,
    UserPermissionsRepository,
    UserRolesRepository,
    UserContextRepository,
  ],
})
export class UsersModule {}
