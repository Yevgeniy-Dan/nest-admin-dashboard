import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';

import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';

import { SignInService } from './sign-in.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth/sign-in')
export class SignInController {
  constructor(private signinService: SignInService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  @ApiOperation({ summary: 'User sign-in' })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: SignInResponseDto,
  })
  async signin(@Req() req, @Res({ passthrough: true }) res: Response) {
    const signinResponse: SignInResponseDto = await this.signinService.signin(
      req.user._doc,
    );

    res.cookie('refreshToken', signinResponse.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //for 1 week
      secure: true,
    });

    return signinResponse;
  }
}
