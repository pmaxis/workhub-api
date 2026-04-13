import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { paymentsAbilityDefinitions } from '@/modules/payments/ability/payments.ability';
import { PaymentsController } from '@/modules/payments/controller/payments.controller';
import { PaymentsService } from '@/modules/payments/service/payments.service';
import { PaymentsRepository } from '@/modules/payments/repository/payments.repository';

@Module({
  imports: [DatabaseModule, AbilityModule.forModule(paymentsAbilityDefinitions)],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
