import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({ description: 'JWT access token (send as Authorization: Bearer <token>)' })
  accessToken: string;
}
