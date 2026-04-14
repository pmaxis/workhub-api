import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJournalEntryDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  entryDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ example: 'Today I…' })
  @IsString()
  @MaxLength(100_000)
  body: string;

  @ApiPropertyOptional({ example: 'grateful' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mood?: string;
}
