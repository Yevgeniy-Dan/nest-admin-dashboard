import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<IUser>,
  ) {}

  async create(user: CreateUserDto): Promise<IUser> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.userModel.findOne({
      email,
    });

    return user;
  }
}
