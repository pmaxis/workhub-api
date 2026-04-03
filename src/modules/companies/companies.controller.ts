import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { CompaniesService } from '@/modules/companies/companies.service';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(@CurrentUserId() userId: string): Promise<CompanyResponseDto[]> {
    return this.companiesService.listForUser(userId);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.createForUser(userId, dto);
  }
}
