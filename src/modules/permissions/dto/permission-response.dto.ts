import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PermissionResponseDto {
  @Expose() id: string;
  @Expose() key: string;
  @Expose() description?: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

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
