import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { ProfileRepository } from '@/modules/profile/repository/profile.repository';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string): Promise<UserResponseDto | null> {
    const user = await this.profileRepository.findById(userId);
    if (!user) return null;
    return new UserResponseDto({
      ...user,
      roles: user.roles.map((ur) => new RoleResponseDto(ur.role)),
    });
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
    return new UserResponseDto({
      ...updated,
      roles: updated.roles.map((ur) => new RoleResponseDto(ur.role)),
    });
  }
}
