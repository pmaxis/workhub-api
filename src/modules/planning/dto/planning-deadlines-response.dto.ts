import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

export class PlanningDeadlineTaskDto {
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

export class PlanningDeadlinesResponseDto {
  @ApiProperty({ type: [PlanningDeadlineTaskDto] })
  tasks: PlanningDeadlineTaskDto[];
}
