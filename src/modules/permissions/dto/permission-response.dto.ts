import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PermissionResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  key: string;
  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description?: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(permission: {
    id: string;
    key: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = permission.id;
    this.key = permission.key;
    this.description = permission.description ?? null;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}
