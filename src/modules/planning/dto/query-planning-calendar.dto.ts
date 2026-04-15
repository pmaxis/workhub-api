import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class QueryPlanningCalendarDto {
  @ApiProperty({ type: String, format: 'date', example: '2026-04-01' })
  @IsDateString()
  from: string;

  @ApiProperty({ type: String, format: 'date', example: '2026-04-30' })
  @IsDateString()
  to: string;
}
