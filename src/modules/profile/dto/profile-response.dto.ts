import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export type AccountType = 'freelancer' | 'client';

@Exclude()
export class ProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  email: string;
  @ApiProperty()
  @Expose()
  firstName: string;
  @ApiProperty()
  @Expose()
  lastName: string;
  @ApiPropertyOptional({ nullable: true })
  @Expose()
  thirdName?: string | null;
  @ApiProperty({ type: [String] })
  @Expose()
  permissions: string[];
  @ApiProperty({ enum: ['freelancer', 'client'] })
  @Expose()
  accountType: AccountType;
  @ApiProperty()
  @Expose()
  hasCompanyMembership: boolean;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  constructor(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    thirdName?: string | null;
    permissions: string[];
    accountType: AccountType;
    hasCompanyMembership: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.thirdName = data.thirdName;
    this.permissions = data.permissions;
    this.accountType = data.accountType;
    this.hasCompanyMembership = data.hasCompanyMembership;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
