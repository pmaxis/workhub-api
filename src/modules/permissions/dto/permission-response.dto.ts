import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class PermissionResponseDto {
  @Expose() id: string;
  @Expose() key: string;
  @Expose() description?: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(partial: Partial<PermissionResponseDto>) {
    Object.assign(this, partial);
  }
}
