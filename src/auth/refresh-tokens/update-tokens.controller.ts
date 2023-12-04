import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { JwtRefreshAuthGuard } from '../guards/jwt-refresh.guard';
import { UpdateTokensService } from './update-tokens.service';

import { Cookies } from 'src/decorators/cookies.decorator';

import { REFRESH_TOKEN_LIFESPAN } from 'src/constants';

@Controller('auth/refresh')
export class UpdateTokensController {
  constructor(private updateTokensService: UpdateTokensService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Post()
  async update(
    @Cookies('refreshToken') refreshToken: string,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const response = await this.updateTokensService.update(
        refreshToken,
        req.user,
      );

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        maxAge: REFRESH_TOKEN_LIFESPAN * 24 * 60 * 60 * 1000, //for 1 week
        secure: true,
      });

      return response;
    } catch (error) {
      return new Error(`${JSON.stringify(error)}`);
    }
  }
}
