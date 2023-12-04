import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { User } from './schemas/user.schema';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: CreateUserDto): Promise<IUser> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findOne(email: string): Promise<IUser | undefined> {
    return await this.userModel.findOne({
      email,
    });
  }
}
