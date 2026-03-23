import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InvitationResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() status: string;
  @Expose() companyId: string | null;
  @Expose() expiresAt: Date;
  @Expose() createdAt: Date;
  /** One-time, only in create response for building invite link */
  @Expose() token?: string;

  constructor(partial: Partial<InvitationResponseDto>) {
    Object.assign(this, partial);
  }
}
