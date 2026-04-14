import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class JournalEntryResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  entryDate: Date;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  title: string | null;

  @ApiProperty()
  @Expose()
  body: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  mood: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(row: {
    id: string;
    userId: string;
    entryDate: Date;
    title: string | null;
    body: string;
    mood: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.userId = row.userId;
    this.entryDate = row.entryDate;
    this.title = row.title;
    this.body = row.body;
    this.mood = row.mood;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
