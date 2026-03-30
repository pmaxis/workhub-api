import { Injectable } from '@nestjs/common';
import { ClientStatus } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class UserOnboardingRepository {
  constructor(private readonly database: DatabaseService) {}

  async createFreelancerProfile(userId: string): Promise<void> {
    await this.database.freelancerProfile.create({ data: { userId } });
  }

  async setupClientFromInvitation(clientUserId: string, invitedByUserId: string): Promise<void> {
    await this.database.$transaction(async (tx) => {
      const clientProfile = await tx.clientProfile.create({ data: { userId: clientUserId } });

      const freelancerProfile = await tx.freelancerProfile.findUnique({
        where: { userId: invitedByUserId },
      });

      if (freelancerProfile) {
        await tx.clientRelation.create({
          data: {
            freelancerProfileId: freelancerProfile.id,
            clientProfileId: clientProfile.id,
            status: ClientStatus.ACTIVE,
          },
        });
      }
    });
  }
}
