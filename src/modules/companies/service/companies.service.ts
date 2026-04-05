import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subject } from '@casl/ability';
import { CLIENT_ROLE_SLUG } from '@/common/constants/reserved';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { CompaniesRepository } from '@/modules/companies/repository/companies.repository';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
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
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async findAll(userId: string): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesRepository.findAllByUserId(userId);
    return companies.map((c) => new CompanyResponseDto(c));
  }

  async create(userId: string, dto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const user = await this.companiesRepository.findUserForCreate(userId);
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

    const company = await this.companiesRepository.createWithMembership({
      userId,
      name,
      slug,
      clientProfileId: user.clientProfile?.id,
    });

    return new CompanyResponseDto(company);
  }

  async update(
    id: string,
    userId: string,
    ability: AppAbility,
    dto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOneWhereMember(id, userId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (!ability.can(Action.Update, subject('Company', company))) {
      throw new ForbiddenException();
    }

    if (dto.name === undefined) {
      return new CompanyResponseDto(company);
    }

    const name = dto.name.trim();
    if (name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    const baseSlug = slugify(name);
    const slug = await this.resolveUniqueSlug(baseSlug, company.id);

    const updated = await this.companiesRepository.update(id, { name, slug });
    return new CompanyResponseDto(updated);
  }

  async delete(id: string, userId: string, ability: AppAbility): Promise<void> {
    const company = await this.companiesRepository.findOneWhereMember(id, userId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (!ability.can(Action.Delete, subject('Company', company))) {
      throw new ForbiddenException();
    }
    await this.companiesRepository.deleteById(id);
  }

  private async resolveUniqueSlug(base: string, excludeCompanyId?: string): Promise<string> {
    let slug = base;
    let n = 0;
    for (;;) {
      const taken = await this.companiesRepository.isSlugTaken(slug, excludeCompanyId);
      if (!taken) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }
}
