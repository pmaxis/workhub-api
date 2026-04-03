import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { ProfileRepository } from '@/modules/profile/repository/profile.repository';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';

type ProfileUser = NonNullable<Awaited<ReturnType<ProfileRepository['findById']>>>;

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string): Promise<UserResponseDto | null> {
    const user = await this.profileRepository.findById(userId);
    if (!user) return null;
    return this.toDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.profileRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const { password, ...rest } = dto;
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updated = await this.profileRepository.update(userId, {
      ...rest,
      password: hashedPassword,
    });
    return this.toDto(updated);
  }

  private toDto(user: ProfileUser): UserResponseDto {
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))),
    ];
    const { freelancerProfile, clientProfile } = user;
    const hasFreelancerProfile = freelancerProfile != null;
    const hasClientProfile = clientProfile != null;
    const hasCompanyMembership = clientProfile != null && clientProfile.companyMembers.length > 0;
    return new UserResponseDto({
      ...user,
      permissions,
      roles: user.roles.map(
        (ur) =>
          new RoleResponseDto({
            ...ur.role,
            permissions: [],
          }),
      ),
      hasFreelancerProfile,
      hasClientProfile,
      hasCompanyMembership,
    });
  }
}
