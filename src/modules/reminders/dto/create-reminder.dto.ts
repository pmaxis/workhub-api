import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  notes?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  remindAt: string;

  @ApiPropertyOptional({ description: 'Optional linked task (must be visible to you)' })
  @IsOptional()
  @IsString()
  taskId?: string;
}
