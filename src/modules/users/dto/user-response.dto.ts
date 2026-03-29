import { Exclude, Expose } from 'class-transformer';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { Role } from '@/infrastructure/database/generated/client';

@Exclude()
export class UserResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() thirdName?: string | null;
  @Expose() roles: RoleResponseDto[];
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    thirdName?: string | null;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.thirdName = user.thirdName;
    this.roles = user.roles.map((r) => new RoleResponseDto(r));
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
