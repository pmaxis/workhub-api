import { Exclude, Expose } from 'class-transformer';
import { TaskStatus } from '@/infrastructure/database/generated/enums';

@Exclude()
export class TaskResponseDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() description: string | null;
  @Expose() status: TaskStatus;
  @Expose() projectId: string;
  @Expose() assigneeId: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

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
