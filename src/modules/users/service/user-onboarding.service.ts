import { Injectable } from '@nestjs/common';
import { CLIENT_ROLE_SLUG } from '@/common/constants/reserved';
import { UserOnboardingRepository } from '@/modules/users/repository/user-onboarding.repository';
import { UserRolesService } from '@/modules/users/service/user-roles.service';

@Injectable()
export class UserOnboardingService {
  constructor(
    private readonly userOnboardingRepository: UserOnboardingRepository,
    private readonly userRolesService: UserRolesService,
  ) {}

  async ensureFreelancerProfile(userId: string): Promise<void> {
    await this.userOnboardingRepository.createFreelancerProfile(userId);
  }

  async registerClientFromInvitation(clientUserId: string, invitedByUserId: string): Promise<void> {
    await this.userRolesService.addRoleBySlug(clientUserId, CLIENT_ROLE_SLUG);
    await this.userOnboardingRepository.setupClientFromInvitation(clientUserId, invitedByUserId);
  }
}
