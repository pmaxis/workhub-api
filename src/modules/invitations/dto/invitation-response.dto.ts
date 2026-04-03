import { Exclude, Expose } from 'class-transformer';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

@Exclude()
export class InvitationResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() status: InvitationStatus;
  @Expose() companyId: string | null;
  @Expose() expiresAt: Date;
  @Expose() createdAt: Date;
  @Expose() token?: string;

  constructor(invitation: {
    id: string;
    email: string;
    status: InvitationStatus;
    companyId: string | null;
    expiresAt: Date;
    createdAt: Date;
    token?: string;
  }) {
    this.id = invitation.id;
    this.email = invitation.email;
    this.status = invitation.status;
    this.companyId = invitation.companyId;
    this.expiresAt = invitation.expiresAt;
    this.createdAt = invitation.createdAt;
    if (invitation.token !== undefined) {
      this.token = invitation.token;
    }
  }
}
