import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProjectResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string | null;
  @Expose() clientProfileId: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() tasksCount?: number;

  constructor(partial: Partial<ProjectResponseDto>) {
    Object.assign(this, partial);
  }
}
