import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { invoicesAbilityDefinitions } from '@/modules/invoices/ability/invoices.ability';
import { InvoicesController } from '@/modules/invoices/controller/invoices.controller';
import { InvoicesService } from '@/modules/invoices/service/invoices.service';
import { InvoicesRepository } from '@/modules/invoices/repository/invoices.repository';

@Module({
  imports: [DatabaseModule, ProjectsModule, AbilityModule.forModule(invoicesAbilityDefinitions)],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository],
})
export class InvoicesModule {}
