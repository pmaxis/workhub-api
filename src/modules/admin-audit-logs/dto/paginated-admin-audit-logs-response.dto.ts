import { ApiProperty } from '@nestjs/swagger';
import { AdminAuditLogResponseDto } from '@/modules/admin-audit-logs/dto/admin-audit-log-response.dto';

export class PaginatedAdminAuditLogsResponseDto {
  @ApiProperty({ type: [AdminAuditLogResponseDto] })
  data!: AdminAuditLogResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
