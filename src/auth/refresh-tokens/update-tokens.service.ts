import { Injectable } from '@nestjs/common';
import { IJwtTokenResponse } from 'src/interfaces/token.interface';
import { LoginResponseDto } from '../login/dtos/login-response.dto';
import { RefreshTokenService } from '../token/refresh-token/refresh-token.service';
import { AccessTokenService } from '../token/access-token/access-token.service';

@Injectable()
export class UpdateTokensService {
  constructor(
    private authAccessTokenService: AccessTokenService,
    private authRefreshTokenService: RefreshTokenService,
  ) {}

  async update(
    token: string,
    user: IJwtTokenResponse,
  ): Promise<LoginResponseDto> {
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
      const { email } = user;
      return {
        accessToken,
        refreshToken,
        user: { email },
      };
    } catch (error) {
      throw new Error('Refresh token updated failed');
    }
  }
}
