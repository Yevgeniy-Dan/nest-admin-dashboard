import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from 'src/auth/dtos/user-response.dto';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: UserResponseDto;
}
