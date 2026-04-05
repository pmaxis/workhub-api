import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

export class UpdateInvitationDto {
  @ApiPropertyOptional({ enum: InvitationStatus })
  @IsEnum(InvitationStatus)
  @IsOptional()
  status?: InvitationStatus;
}
