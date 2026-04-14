import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBrainTemplateDto {
  @ApiProperty({ example: 'Invoice email' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 'Hi {{name}}, …' })
  @IsString()
  @MaxLength(100_000)
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string;
}
