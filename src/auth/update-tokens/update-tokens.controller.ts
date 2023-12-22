import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtRefreshAuthGuard } from '../guards/jwt-refresh.guard';
import { UpdateTokensService } from './update-tokens.service';

import { Cookies } from 'src/decorators/cookies.decorator';

import { REFRESH_TOKEN_LIFESPAN } from 'src/constants';
import { SignInResponseDto } from '../sign-in/dtos/sign-in-response.dto';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { IRequestWithUserPayload } from 'src/interfaces/request.interface';

@ApiTags('Authentication')
@ApiCookieAuth('refreshToken')
@Controller('auth/refresh')
export class UpdateTokensController {
  constructor(private updateTokensService: UpdateTokensService) {}

  @UseGuards(JwtRefreshAuthGuard, RolesGuard)
  @Roles('user')
  @Post()
  @ApiOperation({
    summary: 'Refresh tokens using refresh token',
    description: `This endpoint requires the use of cookie named 'refreshToken' for authentication`,
  })
  @ApiOkResponse({
    description: 'The token key pair was successfully updated',
    type: SignInResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Cookies('refreshToken') refreshToken: string,
    @Req() req: IRequestWithUserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
    const response = await this.updateTokensService.update(
      refreshToken,
      req.user,
    );

    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_LIFESPAN * 24 * 60 * 60 * 1000, //for 1 week
      secure: true,
    });

    await this.updateTokensService.removeOld(req.user.userId, refreshToken);

    return response;
  }
}
