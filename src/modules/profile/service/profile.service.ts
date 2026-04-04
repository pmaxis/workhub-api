import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { ProfileRepository } from '@/modules/profile/repository/profile.repository';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { ProfileResponseDto } from '@/modules/profile/dto/profile-response.dto';

type ProfileUser = NonNullable<Awaited<ReturnType<ProfileRepository['findById']>>>;

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string): Promise<ProfileResponseDto | null> {
    const user = await this.profileRepository.findById(userId);
    if (!user) return null;
    return this.toDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
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

  private toDto(user: ProfileUser): ProfileResponseDto {
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))),
    ];

    return new ProfileResponseDto({
      ...user,
      permissions,
      accountType: user.freelancerProfile != null ? 'freelancer' : 'client',
      hasCompanyMembership:
        user.clientProfile != null && user.clientProfile.companyMembers.length > 0,
    });
  }
}
