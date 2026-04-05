import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { Role } from '@/infrastructure/database/generated/client';

@Exclude()
export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  email: string;
  @ApiProperty()
  @Expose()
  firstName: string;
  @ApiProperty()
  @Expose()
  lastName: string;
  @ApiPropertyOptional({ nullable: true })
  @Expose()
  thirdName?: string | null;
  @ApiProperty({
    type: () => [RoleResponseDto],
    description: 'User roles (role permissions may be empty in this response)',
  })
  @Expose()
  roles: RoleResponseDto[];
  @ApiProperty({ type: [String], description: 'Flat list of permission keys for the user' })
  @Expose()
  permissions: string[];
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;
  @ApiProperty()
  @Expose()
  hasFreelancerProfile: boolean;
  @ApiProperty()
  @Expose()
  hasClientProfile: boolean;
  @ApiProperty()
  @Expose()
  hasCompanyMembership: boolean;

  constructor(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    thirdName?: string | null;
    roles: Role[];
    permissions?: string[];
    createdAt: Date;
    updatedAt: Date;
    hasFreelancerProfile?: boolean;
    hasClientProfile?: boolean;
    hasCompanyMembership?: boolean;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.thirdName = user.thirdName;
    this.permissions = user.permissions ?? [];
    this.roles = user.roles.map(
      (r) =>
        new RoleResponseDto({
          ...r,
          permissions: [],
        }),
    );
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.hasFreelancerProfile = user.hasFreelancerProfile ?? false;
    this.hasClientProfile = user.hasClientProfile ?? false;
    this.hasCompanyMembership = user.hasCompanyMembership ?? false;
  }
}
