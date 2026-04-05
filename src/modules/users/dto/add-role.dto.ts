import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({ description: 'Role ID from the roles catalog', example: 'clxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
