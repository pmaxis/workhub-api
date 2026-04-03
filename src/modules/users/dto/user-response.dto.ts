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
  @Expose() permissions: string[];
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() hasFreelancerProfile: boolean;
  @Expose() hasClientProfile: boolean;
  @Expose() hasCompanyMembership: boolean;

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
