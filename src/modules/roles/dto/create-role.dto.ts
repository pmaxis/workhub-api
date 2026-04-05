import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'project_manager' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Project manager' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
