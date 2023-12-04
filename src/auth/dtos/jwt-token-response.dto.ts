import { ApiProperty } from '@nestjs/swagger';

import { IJwtTokenResponse } from 'src/interfaces/token.interface';

export class JwtTokenResponseDto implements IJwtTokenResponse {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['refresh', 'access'] })
  type: 'refresh' | 'access';
}
