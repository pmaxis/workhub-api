import { ApiProperty } from '@nestjs/swagger';
import { BrainTemplateResponseDto } from '@/modules/brain-templates/dto/brain-template-response.dto';

export class PaginatedBrainTemplatesResponseDto {
  @ApiProperty({ type: [BrainTemplateResponseDto] })
  data: BrainTemplateResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
