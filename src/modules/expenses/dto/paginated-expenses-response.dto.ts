import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from '@/modules/expenses/dto/expense-response.dto';

export class PaginatedExpensesResponseDto {
  @ApiProperty({ type: [ExpenseResponseDto] })
  data: ExpenseResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
