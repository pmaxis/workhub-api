import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
