import { Controller, Get, Patch, Body } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  async getProfile(@CurrentUserId() userId: string): Promise<UserResponseDto | null> {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.profileService.updateProfile(userId, dto);
  }
}
