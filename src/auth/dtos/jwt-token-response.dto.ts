import { ApiProperty } from '@nestjs/swagger';

import { IJwtTokenResponse } from 'src/interfaces/token.interface';
import { Role } from 'src/roles/schemas/role.schema';

export class JwtTokenResponseDto implements IJwtTokenResponse {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  roles: Role[];

  @ApiProperty({ enum: ['refresh', 'access'] })
  type: 'refresh' | 'access';
}
