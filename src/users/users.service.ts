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

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to retrieve.
   * @returns A Promise resolving to the found user if successful, or undefined if the user is not found.
   */
  async findOne(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      email,
    });
  }

  /**
   * Retrieves a paginated list of users.
   *
   * @param page - The page number of the paginated results (default is 1).
   * @param pageSize - The number of users to include per page (default is 10).
   * @returns A Promise resolving to an array of users for the specified page, or undefined if no users are found.
   */
  async findAll(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<User[] | undefined> {
    const skip = (page - 1) * pageSize;
    return await this.userModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .populate('roles', 'role')
      .exec();
  }

  /**
   * Creates a new user with the provided data.
   *
   * @param user - The data of the user to be created, provided as a CreateUserDto.
   * @returns A Promise resolving to the newly created user.
   */
  async create(user: CreateUserDto, roles: string[]): Promise<User> {
    const newUser = new this.userModel({
      ...user,
      roles,
    });
    return await newUser.save();
  }

  /**
   * Updates user information with the specified data.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param userData - The data to be updated in the user, provided as an UpdateUserDto.
   * @returns A Promise resolving to the updated user if successful, or an Error (NotFoundException) if the user is not found.
   */
  async update(userId: string, userData: UpdateUserDto): Promise<User | Error> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, {
        email: userData.email,
      })
      .setOptions({ new: true });

    if (!user) {
      return new NotFoundException();
    }

    return user;
  }

  /**
   * Deletes a user with the specified userId.
   *
   * @param userId - The unique identifier of the user to be deleted.
   * @returns A Promise resolving to void if the deletion is successful, or an Error (NotFoundException) if the user is not found.
   */
  async delete(userId: string): Promise<void | Error> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return new NotFoundException();
    }
  }
}
