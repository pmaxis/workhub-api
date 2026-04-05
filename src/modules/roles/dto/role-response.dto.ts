import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { Permission } from '@/infrastructure/database/generated/client';

@Exclude()
export class RoleResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  slug: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty({ type: () => [PermissionResponseDto] })
  @Expose()
  permissions: PermissionResponseDto[];
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(role: {
    id: string;
    slug: string;
    name: string;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = role.id;
    this.slug = role.slug;
    this.name = role.name;
    this.permissions = role.permissions.map((p) => new PermissionResponseDto(p));
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}
