import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { CompaniesService } from '@/modules/companies/service/companies.service';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';

@ApiTags('Companies')
@ApiBearerAuth('access-token')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List companies for the current user' })
  @ApiOkResponse({ type: [CompanyResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Company'))
  findAll(@CurrentUserId() userId: string): Promise<CompanyResponseDto[]> {
    return this.companiesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create company' })
  @ApiCreatedResponse({ type: CompanyResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Company'))
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Company'))
  update(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.update(id, userId, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiNoContentResponse({ description: 'Company deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Company'))
  delete(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<void> {
    return this.companiesService.delete(id, userId, ability);
  }
}
