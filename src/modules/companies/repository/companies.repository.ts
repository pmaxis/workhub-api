import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly database: DatabaseService) {}

  async findAllByUserId(userId: string) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: {
          include: {
            companyMembers: { include: { company: true } },
          },
        },
      },
    });
    if (!user?.clientProfile) return [];
    return user.clientProfile.companyMembers.map((m) => m.company);
  }

  async findUserForCreate(userId: string) {
    return this.database.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: { select: { id: true } },
        roles: { include: { role: { select: { slug: true } } } },
        clientProfile: { select: { id: true } },
      },
    });
  }

  async isSlugTaken(slug: string, excludeCompanyId?: string): Promise<boolean> {
    const row = await this.database.company.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!row) return false;
    if (excludeCompanyId != null && row.id === excludeCompanyId) return false;
    return true;
  }

  async findOneWhereMember(companyId: string, userId: string) {
    return this.database.company.findFirst({
      where: {
        id: companyId,
        companyMembers: {
          some: { clientProfile: { userId } },
        },
      },
    });
  }

  async update(id: string, data: { name: string; slug: string }) {
    return this.database.company.update({
      where: { id },
      data,
    });
  }

  async createWithMembership(params: {
    userId: string;
    name: string;
    slug: string;
    clientProfileId?: string;
  }) {
    return this.database.$transaction(async (tx) => {
      let clientProfileId = params.clientProfileId;
      if (!clientProfileId) {
        const cp = await tx.clientProfile.create({ data: { userId: params.userId } });
        clientProfileId = cp.id;
      }
      return tx.company.create({
        data: {
          name: params.name,
          slug: params.slug,
          companyMembers: {
            create: { clientProfileId },
          },
        },
      });
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.database.$transaction(async (tx) => {
      await tx.companyMember.deleteMany({ where: { companyId: id } });
      await tx.company.delete({ where: { id } });
    });
  }
}
