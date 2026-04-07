import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from '@/modules/notifications/dto/notification-response.dto';

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data: NotificationResponseDto[];

  @ApiProperty({ description: 'Total matching notifications (all pages)' })
  total: number;

  @ApiProperty({ description: 'Current page (1-based)' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  limit: number;
}
