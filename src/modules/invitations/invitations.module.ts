import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { InvitationsController } from '@/modules/invitations/controller/invitations.controller';
import { InvitationsRepository } from '@/modules/invitations/repository/invitations.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
  exports: [InvitationsService],
})
export class InvitationsModule {}
