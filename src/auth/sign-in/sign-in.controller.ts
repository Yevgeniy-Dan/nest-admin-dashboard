import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  FacebookSignInResponseDto,
  SignInResponseDto,
} from './dtos/sign-in-response.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';

import { SignInService } from './sign-in.service';
import { SignUpService } from '../sign-up/sign-up.service';
import {
  IRequestWithFacebookUserPayload,
  IRequestWithUser,
} from 'src/interfaces/request.interface';
import { FacebookAuthGuard } from '../guards/facebook.guard';
import { UserDocument } from 'src/users/schemas/user.schema';

@ApiTags('Authentication')
@Controller('auth/sign-in')
export class SignInController {
  constructor(
    private signinService: SignInService,
    private signupService: SignUpService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  @ApiOperation({ summary: 'User sign-in' })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: SignInResponseDto,
  })
  async signin(
    @Req() req: IRequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
    const signinResponse: SignInResponseDto = await this.signinService.signin(
      req.user,
    );

    res.cookie('refreshToken', signinResponse.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //for 1 week
      secure: true,
    });

    return signinResponse;
  }

  @Get('/facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'User sign-in via facebook' })
  @ApiOkResponse({
    description: 'User successfully logged in via facebook',
    type: typeof HttpStatus,
  })
  async facebookSignIn(): Promise<HttpStatus> {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Redirect for Facebook sign-in' })
  @ApiOkResponse({
    description: 'User successfully signed in via Facebook',
    type: FacebookSignInResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async facebookSignInRedirect(
    @Req() req: IRequestWithFacebookUserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FacebookSignInResponseDto> {
    const user = await this.signupService.socialMediaSignup({
      email: req.user.profile.emails[0].value,
    });

    const signinResponse: SignInResponseDto = await this.signinService.signin(
      user as UserDocument,
    );

    res.cookie('refreshToken', signinResponse.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //for 1 week
      secure: true,
    });

    return {
      ...signinResponse,
      facebookUserId: req.user.userId,
      facebookAccessToken: req.user.accessToken,
      email: req.user.profile.emails[0].value,
    };
  }
}
