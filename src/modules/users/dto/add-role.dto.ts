import { IsString, IsNotEmpty } from 'class-validator';

export class AddRoleDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
