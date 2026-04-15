import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Optional due date/time (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
