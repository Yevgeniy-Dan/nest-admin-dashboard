import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../../interfaces/token.interface';
import { ACCESS_TOKEN_LIFESPAN } from 'src/constants';

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${ACCESS_TOKEN_LIFESPAN}h`,
    });
  }
}
