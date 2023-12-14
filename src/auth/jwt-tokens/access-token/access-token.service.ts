import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJwtPayload } from '../../../interfaces/token.interface';

import { ACCESS_TOKEN_LIFESPAN } from 'src/constants';

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JSON Web Token (JWT) based on the provided payload.
   *
   * @param payload - The payload containing user information to be encoded into the JWT.
   * @returns A string representing the generated JWT.
   */
  generate(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${ACCESS_TOKEN_LIFESPAN}h`,
    });
  }
}
