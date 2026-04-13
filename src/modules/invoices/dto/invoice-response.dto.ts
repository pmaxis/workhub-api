import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';

@Exclude()
export class InvoiceResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  projectId: string | null;

  @ApiProperty()
  @Expose()
  number: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  title: string | null;

  @ApiProperty({ description: 'Decimal amount as string' })
  @Expose()
  amount: string;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty({ enum: InvoiceStatus })
  @Expose()
  status: InvoiceStatus;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  @Expose()
  issuedAt: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  @Expose()
  dueAt: Date | null;

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
    projectId: string | null;
    number: string;
    title: string | null;
    amount: { toFixed: (n: number) => string };
    currency: string;
    status: InvoiceStatus;
    issuedAt: Date | null;
    dueAt: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.userId = row.userId;
    this.projectId = row.projectId;
    this.number = row.number;
    this.title = row.title;
    this.amount = row.amount.toFixed(2);
    this.currency = row.currency;
    this.status = row.status;
    this.issuedAt = row.issuedAt;
    this.dueAt = row.dueAt;
    this.notes = row.notes;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
