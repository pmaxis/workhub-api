import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceClientMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  confirmedAt: Date;
}
