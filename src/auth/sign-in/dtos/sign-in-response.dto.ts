import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class FacebookSignInResponseDto extends SignInResponseDto {
  @ApiProperty()
  facebookAccessToken: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  facebookUserId: string;
}
