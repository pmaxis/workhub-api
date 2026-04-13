import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { PaymentsService } from '@/modules/payments/service/payments.service';
import { CreatePaymentDto } from '@/modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from '@/modules/payments/dto/update-payment.dto';
import { QueryPaymentsDto } from '@/modules/payments/dto/query-payments.dto';
import { PaymentResponseDto } from '@/modules/payments/dto/payment-response.dto';
import { PaginatedPaymentsResponseDto } from '@/modules/payments/dto/paginated-payments-response.dto';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a payment (optional link to your invoice)' })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Payment'))
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUserId() userId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Payment'))
  findAll(
    @Query() query: QueryPaymentsDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedPaymentsResponseDto> {
    return this.paymentsService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: PaymentResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Payment'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: PaymentResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Payment'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.update(id, userId, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Payment'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.paymentsService.delete(id, ability);
  }
}
