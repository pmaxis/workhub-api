import { Exclude, Expose } from 'class-transformer';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';

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

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
