import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CompanyResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() slug: string;

  constructor(company: { id: string; name: string; slug: string }) {
    this.id = company.id;
    this.name = company.name;
    this.slug = company.slug;
  }
}
