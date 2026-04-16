import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminAuditLogActorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;
}
