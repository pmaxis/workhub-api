import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { UsersModule } from '@/modules/users/users.module';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { InvitationsController } from '@/modules/invitations/controller/invitations.controller';
import { InvitationsRepository } from '@/modules/invitations/repository/invitations.repository';
import { invitationsAbilityDefinitions } from '@/modules/invitations/ability/invitations.ability';

@Module({
  imports: [DatabaseModule, UsersModule, AbilityModule.forModule(invitationsAbilityDefinitions)],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
  exports: [InvitationsService],
})
export class InvitationsModule {}
