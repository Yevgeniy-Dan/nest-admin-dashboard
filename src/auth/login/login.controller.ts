import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';

import { LoginResponseDto } from './dtos/login-response.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';

import { LoginService } from './login.service';

@Controller('auth/login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const loginResponse: LoginResponseDto = await this.loginService.login(
      req.user._doc,
    );

    res.cookie('refreshToken', loginResponse.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //for 1 week
      secure: true,
    });

    return loginResponse;
  }
}
