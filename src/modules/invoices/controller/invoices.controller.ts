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
import { InvoicesService } from '@/modules/invoices/service/invoices.service';
import { CreateInvoiceDto } from '@/modules/invoices/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '@/modules/invoices/dto/update-invoice.dto';
import { QueryInvoicesDto } from '@/modules/invoices/dto/query-invoices.dto';
import { InvoiceResponseDto } from '@/modules/invoices/dto/invoice-response.dto';
import { PaginatedInvoicesResponseDto } from '@/modules/invoices/dto/paginated-invoices-response.dto';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice (number auto-generated if omitted)' })
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Invoice'))
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedInvoicesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invoice'))
  findAll(
    @Query() query: QueryInvoicesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedInvoicesResponseDto> {
    return this.invoicesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invoice'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invoice'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Invoice'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.invoicesService.delete(id, ability);
  }
}
