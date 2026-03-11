import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  description?: string;
}
