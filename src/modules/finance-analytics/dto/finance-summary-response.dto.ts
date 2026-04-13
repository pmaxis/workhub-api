import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';

export class InvoiceStatusBreakdownDto {
  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;

  @ApiProperty()
  count: number;

  @ApiProperty({ description: 'Sum of invoice amounts for this status' })
  totalAmount: string;
}

export class FinanceSummaryResponseDto {
  @ApiProperty({ type: [InvoiceStatusBreakdownDto] })
  invoicesByStatus: InvoiceStatusBreakdownDto[];

  @ApiProperty({ description: 'Sum of payment amounts (filtered by receivedAt)' })
  paymentsTotal: string;

  @ApiProperty({ description: 'Sum of expense amounts (filtered by spentAt)' })
  expensesTotal: string;

  @ApiProperty({ description: 'paymentsTotal minus expensesTotal' })
  netCashflow: string;
}
