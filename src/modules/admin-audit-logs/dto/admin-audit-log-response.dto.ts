import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogActorResponseDto } from '@/modules/admin-audit-logs/dto/admin-audit-log-actor-response.dto';

export class AdminAuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: AdminAuditLogLevel })
  level!: AdminAuditLogLevel;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional({ type: Object, description: 'Structured metadata' })
  context!: Record<string, unknown> | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: AdminAuditLogActorResponseDto })
  actor!: AdminAuditLogActorResponseDto | null;
}
