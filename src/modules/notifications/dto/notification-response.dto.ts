import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { NotificationType } from '@/infrastructure/database/generated/enums';

type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Prisma.JsonValue | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  body: string | null;

  @ApiProperty({ nullable: true })
  data: Prisma.JsonValue | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ nullable: true })
  readAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(n: NotificationRecord) {
    this.id = n.id;
    this.userId = n.userId;
    this.type = n.type;
    this.title = n.title;
    this.body = n.body;
    this.data = n.data;
    this.isRead = n.isRead;
    this.readAt = n.readAt;
    this.createdAt = n.createdAt;
    this.updatedAt = n.updatedAt;
  }
}
