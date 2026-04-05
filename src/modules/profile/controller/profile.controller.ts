import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';
import { ProfileResponseDto } from '@/modules/profile/dto/profile-response.dto';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    type: ProfileResponseDto,
    description: 'Returns null when the profile record is missing',
  })
  async getProfile(@CurrentUserId() userId: string): Promise<ProfileResponseDto | null> {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: ProfileResponseDto })
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(userId, dto);
  }
}
