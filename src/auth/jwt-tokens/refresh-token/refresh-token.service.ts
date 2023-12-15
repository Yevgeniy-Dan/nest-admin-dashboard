import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from 'src/users/schemas/user.schema';
import { IJwtPayload } from '../../../interfaces/token.interface';

import { REFRESH_TOKEN_LIFESPAN } from 'src/constants';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Generates a refresh token using the provided payload.
   *
   * @param payload - The payload to be included in the refresh token, conforming to the IJwtPayload interface.
   * @returns A string representing the generated refresh token.
   */
  generate(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${REFRESH_TOKEN_LIFESPAN}d`,
    });
  }

  /**
   * Saves a refresh token for the specified user.
   *
   * @param userId - The unique identifier of the user.
   * @param refreshToken - The refresh token to be saved.
   * @throws NotFoundException - If the user is not found.
   */
  async save(userId: string, refreshToken: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens.push(refreshToken);

    await user.save();
  }

  /**
   * Removes a refresh token for the specified user.
   *
   * @param userId - The unique identifier of the user.
   * @param refreshToken - The refresh token to be removed.
   * @throws NotFoundException - If the user is not found.
   */
  async remove(userId: string, refreshToken: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    await user.save();
  }

  /**
   * Finds a refresh token for the specified user.
   *
   * @param userId - The unique identifier of the user.
   * @param refreshToken - The refresh token to be found.
   * @returns A Promise resolving to the found refresh token if successful, or undefined if the user or token is not found.
   * @throws NotFoundException - If the user is not found.
   */
  async find(
    userId: string,
    refreshToken: string,
  ): Promise<string | undefined> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = user.refreshTokens.find((t) => t === refreshToken);

    return token;
  }
}
