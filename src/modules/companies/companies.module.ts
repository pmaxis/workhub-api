import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { CompaniesController } from '@/modules/companies/controller/companies.controller';
import { CompaniesService } from '@/modules/companies/service/companies.service';
import { CompaniesRepository } from '@/modules/companies/repository/companies.repository';
import { companiesAbilityDefinitions } from '@/modules/companies/ability/companies.ability';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(companiesAbilityDefinitions)],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
