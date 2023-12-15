import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJwtPayload } from '../../../interfaces/token.interface';

import { ACCESS_TOKEN_LIFESPAN } from 'src/constants';

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates an access token using the provided payload.
   *
   * @param payload - The payload to be included in the access token, conforming to the IJwtPayload interface.
   * @returns A string representing the generated access token.
   */
  generate(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${ACCESS_TOKEN_LIFESPAN}h`,
    });
  }
}
