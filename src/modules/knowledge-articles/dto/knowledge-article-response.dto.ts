import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class KnowledgeArticleResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  taskId: string | null;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  body: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  tags: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(row: {
    id: string;
    userId: string;
    taskId: string | null;
    title: string;
    body: string;
    tags: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = row.id;
    this.userId = row.userId;
    this.taskId = row.taskId;
    this.title = row.title;
    this.body = row.body;
    this.tags = row.tags;
    this.createdAt = row.createdAt;
    this.updatedAt = row.updatedAt;
  }
}
