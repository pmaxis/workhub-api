import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

@Exclude()
export class InvitationResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  email: string;
  @ApiProperty({ enum: InvitationStatus })
  @Expose()
  status: InvitationStatus;
  @ApiProperty({ nullable: true })
  @Expose()
  companyId: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  expiresAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiPropertyOptional({ description: 'Present when invitation is created or resent' })
  @Expose()
  token?: string;

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
