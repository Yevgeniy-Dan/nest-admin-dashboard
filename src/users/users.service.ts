import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Creates a new user based on the provided data.
   * @param user - The data object (CreateUserDto) containing information to create the new user.
   * @returns  A Promise resolving to the newly created User object.
   */
  async create(user: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  /**
   * Finds and retrieves a user based on the provided email address.
   * @param email - The email address of the user to be retrieved.
   * @returns A Promise resolving to the found User object or undefined if the user is not found.
   */
  async findOne(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      email,
    });
  }
}
