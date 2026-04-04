import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { ProfileResponseDto } from '@/modules/profile/dto/profile-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUserId() userId: string): Promise<ProfileResponseDto | null> {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(userId, dto);
  }
}
