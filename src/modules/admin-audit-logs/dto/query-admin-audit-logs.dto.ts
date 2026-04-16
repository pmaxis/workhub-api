import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';

export class QueryAdminAuditLogsDto {
  @ApiPropertyOptional({ enum: AdminAuditLogLevel })
  @IsOptional()
  @IsEnum(AdminAuditLogLevel)
  level?: AdminAuditLogLevel;

  @ApiPropertyOptional({ description: 'Filter by source prefix / exact module key' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
