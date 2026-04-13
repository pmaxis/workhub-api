import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ExpenseResponseDto {
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
  description: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  category: string | null;

  @ApiProperty({ description: 'Decimal amount as string' })
  @Expose()
  amount: string;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  spentAt: Date;

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
    description: string;
    category: string | null;
    amount: { toFixed: (n: number) => string };
    currency: string;
    spentAt: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.userId = row.userId;
    this.projectId = row.projectId;
    this.description = row.description;
    this.category = row.category;
    this.amount = row.amount.toFixed(2);
    this.currency = row.currency;
    this.spentAt = row.spentAt;
    this.notes = row.notes;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
