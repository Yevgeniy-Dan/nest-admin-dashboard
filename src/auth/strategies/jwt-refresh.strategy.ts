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
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService<IConfiguration>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_KEY'),
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtTokenResponse> {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      type: 'refresh',
    };
  }
}
