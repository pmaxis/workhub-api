import { IsEnum, IsOptional } from 'class-validator';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

export class UpdateInvitationDto {
  @IsEnum(InvitationStatus)
  @IsOptional()
  status?: InvitationStatus;
}
