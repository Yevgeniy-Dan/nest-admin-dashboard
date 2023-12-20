import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/users/schemas/user.schema';

import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /** Validates a reset password token by checking its existence, expiration time, and validity.
   * @param resetPasswordToken - The token to be validated.
   * @returns {Promise<UserDocument>} - Returns a Promise resolving to the corresponding user document if the token is valid.
   * @throws {NotFoundException} - If the user associated with the token is not found.
   * @throws {BadRequestException} - If the token lacks an expiration time, has an invalid expiration time format, or has expired.
   */
  async validateToken(resetPasswordToken: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      resetPasswordToken,
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid reset password token, user not found.',
      );
    }

    const expirationTime = user.resetPasswordToken.split('|')[1];

    if (!expirationTime) {
      throw new BadRequestException(
        'The expiration time is not present in the token',
      );
    }

    const expirationTimestamp = parseInt(expirationTime, 10);

    if (isNaN(expirationTimestamp)) {
      throw new BadRequestException(
        'The expiration time is not a valid number',
      );
    }

    const currentDate = Date.now();

    if (currentDate > expirationTimestamp) {
      throw new BadRequestException('The password token has expired');
    }

    return user;
  }

  /**
   * Sets a new password for a user based on a valid reset password token.
   *
   * @param token - The reset password token associated with the user.
   * @param newPassword - The new password to be set for the user.
   * @returns {Promise<User>} - Returns a Promise resolving to the updated User object with the new password.
   *
   * If the token is invalid or the user is not found, returns undefined.
   */
  async setNewPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.validateToken(token);

    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;

      await user.save();

      return user;
    }
  }
}
