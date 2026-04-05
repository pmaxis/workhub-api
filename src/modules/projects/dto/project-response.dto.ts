import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProjectResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty({ nullable: true })
  @Expose()
  description: string | null;
  @ApiProperty()
  @Expose()
  ownerId: string;
  @ApiProperty({ nullable: true })
  @Expose()
  companyId: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;
  @ApiProperty()
  @Expose()
  tasksCount: number;

  constructor(project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    companyId: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasksCount: number;
  }) {
    this.id = project.id;
    this.name = project.name;
    this.description = project.description;
    this.ownerId = project.ownerId;
    this.companyId = project.companyId;
    this.createdAt = project.createdAt;
    this.updatedAt = project.updatedAt;
    this.tasksCount = project.tasksCount;
  }
}
