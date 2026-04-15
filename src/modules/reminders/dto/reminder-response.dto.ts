import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReminderResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ nullable: true })
  @Expose()
  notes: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  remindAt: Date;

  @ApiProperty({ nullable: true })
  @Expose()
  taskId: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  @Expose()
  dismissedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(row: {
    id: string;
    title: string;
    notes: string | null;
    remindAt: Date;
    taskId: string | null;
    dismissedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.title = row.title;
    this.notes = row.notes;
    this.remindAt = row.remindAt;
    this.taskId = row.taskId;
    this.dismissedAt = row.dismissedAt;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
