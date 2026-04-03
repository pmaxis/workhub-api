import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_ROLE_SLUG } from '@/common/constants/reserved';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';

function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'company';
}

@Injectable()
export class CompaniesService {
  constructor(private readonly database: DatabaseService) {}

  async listForUser(userId: string): Promise<CompanyResponseDto[]> {
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
    return user.clientProfile.companyMembers.map((m) => new CompanyResponseDto(m.company));
  }

  async createForUser(userId: string, dto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: { select: { id: true } },
        roles: { include: { role: { select: { slug: true } } } },
        clientProfile: { select: { id: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.freelancerProfile) {
      throw new ForbiddenException('Only client accounts can create a company');
    }
    const hasClientRole = user.roles.some((ur) => ur.role.slug === CLIENT_ROLE_SLUG);
    if (!hasClientRole) {
      throw new ForbiddenException('Client role required');
    }

    const name = dto.name.trim();
    const baseSlug = slugify(name);
    const slug = await this.resolveUniqueSlug(baseSlug);

    const company = await this.database.$transaction(async (tx) => {
      let clientProfileId = user.clientProfile?.id;
      if (!clientProfileId) {
        const cp = await tx.clientProfile.create({ data: { userId } });
        clientProfileId = cp.id;
      }
      return tx.company.create({
        data: {
          name,
          slug,
          companyMembers: {
            create: { clientProfileId },
          },
        },
      });
    });

    return new CompanyResponseDto(company);
  }

  private async resolveUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let n = 0;
    for (;;) {
      const existing = await this.database.company.findUnique({ where: { slug } });
      if (!existing) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }
}
