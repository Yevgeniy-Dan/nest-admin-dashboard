import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SignOutService } from './sign-out.service';

import { Cookies } from 'src/decorators/cookies.decorator';

import { JwtAccessAuthGuard } from '../guards/jwt-access.guard';

import { SignOutResponseDto } from './dtos/sign-out.dto';

@ApiTags('Authentication')
@ApiCookieAuth('refreshToken')
@Controller('auth/sign-out')
export class SignOutController {
  constructor(private signoutService: SignOutService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'User sign-out',
    description: "This endpoint requires the use of cookie named 'refreshToken",
  })
  @ApiCreatedResponse({
    description: 'User successfully signed out',
    type: SignOutResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async signout(
    @Cookies('refreshToken') refreshToken: string,
    @Req() req,
  ): Promise<SignOutResponseDto> {
    const oldToken = await this.signoutService.signout(
      req.user.userId,
      refreshToken,
    );
    return {
      refreshToken: oldToken,
    };
  }
}
