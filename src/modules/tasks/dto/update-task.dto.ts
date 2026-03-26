import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
