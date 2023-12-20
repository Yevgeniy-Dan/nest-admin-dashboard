import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IConfiguration } from 'src/interfaces/configuration.interface';
import {
  IJwtPayload,
  IJwtTokenResponse,
} from '../../interfaces/token.interface';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private configService: ConfigService<IConfiguration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_KEY'),
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtTokenResponse> {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      type: 'access',
    };
  }
}
