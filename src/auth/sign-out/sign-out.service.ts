import { Injectable } from '@nestjs/common';

import { RefreshTokenService } from '../jwt-tokens/refresh-token/refresh-token.service';

@Injectable()
export class SignOutService {
  constructor(private authRefreshTokenService: RefreshTokenService) {}

  async signout(userId: string, refreshToken: string): Promise<string> {
    await this.authRefreshTokenService.remove(userId, refreshToken);
    return refreshToken;
  }
}
