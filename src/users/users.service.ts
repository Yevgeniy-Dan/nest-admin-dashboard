import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { User } from './schemas/user.schema';
import UpdateUserDto from './dtos/user-input.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      email,
    });
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<User[] | undefined> {
    const skip = (page - 1) * pageSize;
    return await this.userModel.find().skip(skip).limit(pageSize).exec();
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async update(userId: string, userData: UpdateUserDto): Promise<User | Error> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, userData)
      .setOptions({ new: true });

    if (!user) {
      return new NotFoundException();
    }

    return user;
  }

  async delete(userId: string): Promise<void | Error> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return new NotFoundException();
    }
  }
}
