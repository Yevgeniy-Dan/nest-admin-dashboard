import { Injectable } from '@nestjs/common';

import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { IUser } from 'src/users/interfaces/user.interface';

import { AccessTokenService } from '../jwt-tokens/access-token/access-token.service';
import { RefreshTokenService } from '../jwt-tokens/refresh-token/refresh-token.service';

@Injectable()
export class SignInService {
  constructor(
    private authAccessTokenService: AccessTokenService,
    private authRefreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Signs in a user and generates access and refresh tokens for authentication.
   * @param user - The user object (IUser) representing the user to be signed in.
   * @returns A Promise resolving to a SignInResponseDto containing the generated access and refresh tokens.
   */
  async signin(user: IUser): Promise<SignInResponseDto> {
    //TODO: define payload as {username: string; sub: string} in the future
    const accessToken = this.authAccessTokenService.generate({
      email: user.email,
      sub: user._id.toString(),
    });

    const refreshToken = this.authRefreshTokenService.generate({
      email: user.email,
      sub: user._id.toString(),
    });

    await this.authRefreshTokenService.save(user._id.toString(), refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }
}
