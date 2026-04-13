import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from '@/modules/payments/dto/payment-response.dto';

export class PaginatedPaymentsResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  data: PaymentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
