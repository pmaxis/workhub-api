import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskResponseDto {
  @Expose() id: string;
  @Expose() title: string;
  @Expose() description: string | null;
  @Expose() status: string;
  @Expose() projectId: string;
  @Expose() assigneeId: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}
