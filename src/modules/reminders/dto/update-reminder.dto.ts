import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateReminderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v: unknown) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(10_000)
  notes?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @ApiPropertyOptional({ nullable: true, description: 'Set to null to unlink' })
  @IsOptional()
  @ValidateIf((_, v: unknown) => v !== null && v !== undefined)
  @IsString()
  taskId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    description: 'ISO time when dismissed, or null to restore as active',
  })
  @IsOptional()
  @ValidateIf((_, v: unknown) => v !== null && v !== undefined)
  @IsDateString()
  dismissedAt?: string | null;
}
