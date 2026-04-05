import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddPermissionDto {
  @ApiProperty({ description: 'Permission ID' })
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
