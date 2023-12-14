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
   * Updates the user's authentication tokens using a new refresh token.
   *
   * @param token - The new refresh token to update.
   * @param user - The user information extracted from the JWT token.
   * @returns A Promise resolving to a SignInResponseDto containing the updated access and refresh tokens.
   * @throws Error if the provided refresh token is invalid or if the token update process fails.
   */
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

  /**
   * Removes an old refresh token associated with a user from the database.
   *
   * @param userId - The unique identifier of the user.
   * @param token - The refresh token to be removed.
   * @returns A Promise resolving to void once the removal is complete.
   */
  async removeOld(userId: string, token: string): Promise<void> {
    await this.authRefreshTokenService.remove(userId, token);
  }
}
