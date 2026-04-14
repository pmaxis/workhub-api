import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBrainNoteDto {
  @ApiProperty({ example: 'Meeting recap' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 'Key points from the call…' })
  @IsString()
  @MaxLength(100_000)
  body: string;

  @ApiPropertyOptional({ example: 'work,ideas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string;
}
