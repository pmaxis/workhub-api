import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProjectResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string | null;
  @Expose() ownerId: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() tasksCount: number;

  constructor(project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    tasksCount: number;
  }) {
    this.id = project.id;
    this.name = project.name;
    this.description = project.description;
    this.ownerId = project.ownerId;
    this.createdAt = project.createdAt;
    this.updatedAt = project.updatedAt;
    this.tasksCount = project.tasksCount;
  }
}
