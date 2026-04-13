import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaymentResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  invoiceId: string | null;

  @ApiProperty({ description: 'Decimal amount as string' })
  @Expose()
  amount: string;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  receivedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  method: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  notes: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(row: {
    id: string;
    userId: string;
    invoiceId: string | null;
    amount: { toFixed: (n: number) => string };
    currency: string;
    receivedAt: Date;
    method: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.userId = row.userId;
    this.invoiceId = row.invoiceId;
    this.amount = row.amount.toFixed(2);
    this.currency = row.currency;
    this.receivedAt = row.receivedAt;
    this.method = row.method;
    this.notes = row.notes;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
