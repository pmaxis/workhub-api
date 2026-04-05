import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'projects.read' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
