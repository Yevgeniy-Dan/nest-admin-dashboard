import { Injectable } from '@nestjs/common';

import { RefreshTokenService } from '../jwt-tokens/refresh-token/refresh-token.service';

@Injectable()
export class SignOutService {
  constructor(private authRefreshTokenService: RefreshTokenService) {}

  /**
   * Signs out a user by removing the specified refresh token associated with the user.
   *
   * @param userId - The unique identifier of the user.
   * @param refreshToken - The refresh token to be removed during the sign-out process.
   * @returns A Promise resolving to the removed refresh token.
   */
  async signout(userId: string, refreshToken: string): Promise<string> {
    await this.authRefreshTokenService.remove(userId, refreshToken);
    return refreshToken;
  }
}
