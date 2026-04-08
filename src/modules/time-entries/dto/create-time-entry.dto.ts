import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateTimeEntryDto {
  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  startedAt: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @ValidateIf((_, v) => v !== undefined && v !== null)
  @IsDateString()
  endedAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
