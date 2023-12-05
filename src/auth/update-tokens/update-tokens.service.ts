import { Injectable } from '@nestjs/common';

import { IJwtTokenResponse } from 'src/interfaces/token.interface';
import { SignInResponseDto } from '../sign-in/dtos/sign-in-response.dto';

import { AccessTokenService } from '../jwt-tokens/access-token/access-token.service';
import { RefreshTokenService } from '../jwt-tokens/refresh-token/refresh-token.service';

@Injectable()
export class UpdateTokensService {
  constructor(
    private authAccessTokenService: AccessTokenService,
    private authRefreshTokenService: RefreshTokenService,
  ) {}

  async update(
    token: string,
    user: IJwtTokenResponse,
  ): Promise<SignInResponseDto> {
    try {
      const { userId } = user;
      const tokenInDb = await this.authRefreshTokenService.find(userId, token);

      if (!tokenInDb) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = this.authAccessTokenService.generate({
        email: user.email,
        sub: user.userId,
      });

      const refreshToken = this.authRefreshTokenService.generate({
        email: user.email,
        sub: user.userId,
      });

      await this.authRefreshTokenService.save(user.userId, refreshToken);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error('Refresh token updated failed');
    }
  }

  async removeOld(userId: string, token: string): Promise<void> {
    await this.authRefreshTokenService.remove(userId, token);
  }
}
