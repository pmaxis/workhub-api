import { IsNotEmpty, IsString } from 'class-validator';

export class AddPermissionDto {
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
