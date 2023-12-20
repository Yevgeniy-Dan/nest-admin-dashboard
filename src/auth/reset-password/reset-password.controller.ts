import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import PasswordResetInputDto from './dtos/password-reset-input.dto';
import PasswordResetLinkInputDto from './dtos/password-reset-link-input.dto';
import { UserDocument } from 'src/users/schemas/user.schema';

import { IConfiguration } from 'src/interfaces/configuration.interface';

import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordService } from './reset-password.service';
import { UsersService } from 'src/users/users.service';

import { v4 as uuidv4 } from 'uuid';

import { Response } from 'express';
import { Cookies } from 'src/decorators/cookies.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PasswordResetResponseDto } from './dtos/password-reset-response.dto';

@ApiTags('Authentication')
@ApiCookieAuth('resetPasswordToken')
@Controller('auth/reset-password')
export class ResetPasswordController {
  constructor(
    private usersService: UsersService,
    private resetPasswordService: ResetPasswordService,
    private mailService: MailService,
    private configService: ConfigService<IConfiguration>,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Reset Password',
    description:
      "Resets the user's password based on a valid reset password token.",
  })
  @ApiQuery({
    name: 'token',
    description: 'The reset password token.',
    required: true,
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'The expiration time is not present in the token',
  })
  @ApiBadRequestResponse({
    description: 'The expiration time is not a valid number',
  })
  @ApiBadRequestResponse({
    description: 'The password token has expired',
  })
  @ApiNotFoundResponse({
    description: 'Invalid reset password token, user not found.',
  })
  @ApiOkResponse({
    description: 'Redirects to the password reset page on the client.',
  })
  async resetPassword(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = await this.resetPasswordService.validateToken(token);

    if (user) {
      return res
        .cookie('resetPasswordToken', user.resetPasswordToken, {
          httpOnly: true,
          maxAge: 3 * 60 * 1000, // 3 minutes
          secure: true,
        })
        .redirect(
          `${this.configService.get<string>(
            'CLIENT_ORIGIN',
          )}/auth/reset-password`, // url for resetting password on the client
        );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Send Password Reset Link',
    description: 'Sends a password reset link to the specified email address.',
  })
  @ApiBody({
    type: PasswordResetLinkInputDto,
  })
  @ApiOkResponse({
    description: 'Password reset link sent successfully!',
    type: PasswordResetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found for the specified email address.',
  })
  async sendPasswordResetLink(
    @Body() { email }: PasswordResetLinkInputDto,
  ): Promise<PasswordResetResponseDto> {
    const user = (await this.usersService.findOne(email)) as UserDocument;

    if (!user) {
      throw new NotFoundException(`User with ${email} not found`);
    }

    const expirationTime = Date.now() + 3 * 60 * 1000; // 3 minutes
    const passwordResetToken = `${uuidv4()}|${expirationTime}`;

    user.resetPasswordToken = passwordResetToken;

    await user.save();
    await this.mailService.sendPasswordResetMail(
      user.email,
      `${this.configService.get<string>('API_URL')}/auth/reset-password?token=${
        user.resetPasswordToken
      }`,
    );

    return {
      success: true,
      message: 'Password reset link send successfully!',
    };
  }

  @Post('/change')
  @ApiOperation({
    summary: 'Set New Password',
    description: `Sets a new password for a user based on a valid reset password token. This endpoint requires the use of cookie named 'resetPasswordToken' for authentication`,
  })
  @ApiBody({
    type: PasswordResetInputDto,
  })
  @ApiOkResponse({
    description:
      'Redirects to the login page on the client after successful password reset.',
  })
  @ApiNotFoundResponse({
    description: 'Invalid reset password token, user not found.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid reset password token or user not found.',
  })
  async setNewPassword(
    @Cookies('resetPasswordToken') resetPasswordToken: string,
    @Body() { password }: PasswordResetInputDto,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.resetPasswordService.setNewPassword(
      resetPasswordToken,
      password,
    );

    if (user) {
      return res.redirect(
        `${this.configService.get<string>('CLIENT_ORIGIN')}/auth/login`,
      );
    }
  }
}
