import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

export class PlanningCalendarTaskDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  dueAt: Date;
}

export class PlanningCalendarReminderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, format: 'date-time' })
  remindAt: Date;

  @ApiProperty({ nullable: true })
  taskId: string | null;
}

export class PlanningCalendarResponseDto {
  @ApiProperty({ type: [PlanningCalendarTaskDto] })
  tasks: PlanningCalendarTaskDto[];

  @ApiProperty({ type: [PlanningCalendarReminderDto] })
  reminders: PlanningCalendarReminderDto[];
}
