import { ApiProperty } from '@nestjs/swagger';
import { BrainNoteResponseDto } from '@/modules/brain-notes/dto/brain-note-response.dto';

export class PaginatedBrainNotesResponseDto {
  @ApiProperty({ type: [BrainNoteResponseDto] })
  data: BrainNoteResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
