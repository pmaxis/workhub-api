import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

@Exclude()
export class TaskResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  title: string;
  @ApiProperty({ nullable: true })
  @Expose()
  description: string | null;
  @ApiProperty({ enum: TaskStatus })
  @Expose()
  status: TaskStatus;
  @ApiProperty()
  @Expose()
  projectId: string;
  @ApiProperty()
  @Expose()
  assigneeId: string;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    projectId: string;
    assigneeId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.projectId = task.projectId;
    this.assigneeId = task.assigneeId;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
  }
}
