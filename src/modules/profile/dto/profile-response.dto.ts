import { Exclude, Expose } from 'class-transformer';

export type AccountType = 'freelancer' | 'client';

@Exclude()
export class ProfileResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() thirdName?: string | null;
  @Expose() permissions: string[];
  @Expose() accountType: AccountType;
  @Expose() hasCompanyMembership: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

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
