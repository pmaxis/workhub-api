import { ApiProperty } from '@nestjs/swagger';
import { JournalEntryResponseDto } from '@/modules/journal-entries/dto/journal-entry-response.dto';

export class PaginatedJournalEntriesResponseDto {
  @ApiProperty({ type: [JournalEntryResponseDto] })
  data: JournalEntryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
