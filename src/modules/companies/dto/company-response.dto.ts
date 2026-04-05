import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CompanyResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  slug: string;

  constructor(company: { id: string; name: string; slug: string }) {
    this.id = company.id;
    this.name = company.name;
    this.slug = company.slug;
  }
}
