import { ApiProperty } from '@nestjs/swagger';
import { ReminderResponseDto } from '@/modules/reminders/dto/reminder-response.dto';

export class PaginatedRemindersResponseDto {
  @ApiProperty({ type: [ReminderResponseDto] })
  data: ReminderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
