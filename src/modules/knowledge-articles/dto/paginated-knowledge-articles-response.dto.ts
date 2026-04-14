import { ApiProperty } from '@nestjs/swagger';
import { KnowledgeArticleResponseDto } from '@/modules/knowledge-articles/dto/knowledge-article-response.dto';

export class PaginatedKnowledgeArticlesResponseDto {
  @ApiProperty({ type: [KnowledgeArticleResponseDto] })
  data: KnowledgeArticleResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
