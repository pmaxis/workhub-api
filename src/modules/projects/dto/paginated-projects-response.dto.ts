import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({ description: 'Total matching projects (all pages)' })
  total: number;

  @ApiProperty({ description: 'Current page (1-based)' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  limit: number;
}
