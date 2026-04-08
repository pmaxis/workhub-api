import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TimeEntryResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  projectId: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  taskId: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  startedAt: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @Expose()
  endedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(entry: {
    id: string;
    userId: string;
    projectId: string | null;
    taskId: string | null;
    description: string | null;
    startedAt: Date;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = entry.id;
    this.userId = entry.userId;
    this.projectId = entry.projectId;
    this.taskId = entry.taskId;
    this.description = entry.description;
    this.startedAt = entry.startedAt;
    this.endedAt = entry.endedAt;
    this.createdAt = entry.createdAt;
    this.updatedAt = entry.updatedAt;
  }
}
