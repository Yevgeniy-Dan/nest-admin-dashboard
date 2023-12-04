import { Injectable } from '@nestjs/common';

import { LoginResponseDto } from './dtos/login-response.dto';
import { IUser } from 'src/users/interfaces/user.interface';

import { AccessTokenService } from '../tokens/access-token/access-token.service';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';

@Injectable()
export class LoginService {
  constructor(
    private authAccessTokenService: AccessTokenService,
    private authRefreshTokenService: RefreshTokenService,
  ) {}

  async login(user: IUser): Promise<LoginResponseDto> {
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
    const { email } = user; //TODO: Should I use Exclude using class-transformer?
    return {
      accessToken,
      refreshToken,
      user: { email },
    };
  }
}
