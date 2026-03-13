import { Exclude, Expose } from 'class-transformer';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';

@Exclude()
export class RoleResponseDto {
  @Expose() id: string;
  @Expose() slug: string;
  @Expose() name: string;
  @Expose() permissions: PermissionResponseDto[];
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(partial: Partial<RoleResponseDto>) {
    Object.assign(this, partial);
  }
}
