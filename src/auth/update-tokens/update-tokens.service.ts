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

  /**
   * Updates access and refresh tokens for the specified user based on a provided refresh token.
   *
   * @param token - The refresh token used to request new access and refresh tokens.
   * @param user - The user information extracted from the existing tokens.
   * @returns A Promise resolving to a SignInResponseDto containing the new access and refresh tokens.
   * @throws Error - If the refresh token is invalid or if the refresh token update process fails.
   */
  async update(
    token: string,
    user: IJwtTokenResponse,
  ): Promise<SignInResponseDto> {
    const { userId } = user;
    const tokenInDb = await this.authRefreshTokenService.find(userId, token);

    if (!tokenInDb) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = this.authAccessTokenService.generate({
      email: user.email,
      roles: user.roles,
      sub: user.userId,
    });

    const refreshToken = this.authRefreshTokenService.generate({
      email: user.email,
      roles: user.roles,
      sub: user.userId,
    });

    await this.authRefreshTokenService.save(user.userId, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Removes an old refresh token associated with the specified user.
   *
   * @param userId - The unique identifier of the user.
   * @param token - The refresh token to be removed.
   * @returns A Promise resolving to void.
   */
  async removeOld(userId: string, token: string): Promise<void> {
    await this.authRefreshTokenService.remove(userId, token);
  }
}
