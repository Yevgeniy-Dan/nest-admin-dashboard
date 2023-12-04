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

  generate(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${REFRESH_TOKEN_LIFESPAN}d`,
    });
  }

  async save(userId: string, refreshToken: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens.push(refreshToken);

    await user.save();
  }

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
