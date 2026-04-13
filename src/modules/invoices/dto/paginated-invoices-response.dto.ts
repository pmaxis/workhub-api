import { ApiProperty } from '@nestjs/swagger';
import { InvoiceResponseDto } from '@/modules/invoices/dto/invoice-response.dto';

export class PaginatedInvoicesResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  data: InvoiceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
