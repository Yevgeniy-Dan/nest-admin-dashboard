import { ApiProperty } from '@nestjs/swagger';

export class SignOutResponseDto {
  @ApiProperty()
  refreshToken: string;
}
