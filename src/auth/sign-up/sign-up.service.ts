import { Injectable, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

import {
  CreateUserWithPasswordDto,
  CreateUserWithoutPasswordDto,
} from './dtos/create-user.dto';
import { User } from 'src/users/schemas/user.schema';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class SignUpService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  /**
   * Signs up a new user by creating a user account with the provided data.
   *
   * @param user - The data of the user to be signed up, provided as a CreateUserWithPasswordDto.
   * @returns A Promise resolving to the newly created user.
   * @throws HttpException - If a user with the same email already exists.
   */
  async nativeSignup(user: CreateUserWithPasswordDto): Promise<User> {
    try {
      const isExist = await this.usersService.findOne(user.email);
      if (isExist) {
        throw new HttpException(
          `User with email ${user.email} already exists.`,
          500,
        );
      }
    } catch (error) {}

    const password = await bcrypt.hash(user.password, 10);

    //Assign default user role
    const { _id } = await this.rolesService.findOne('user');
    //TODO: assign default 'User' role
    return await this.usersService.create(
      {
        ...user,
        password,
      },
      [_id.toString()],
    );
  }

  /**
   * Signs up a new user using social media credentials.
   *
   * @param user - The data of the user to be signed up, provided as a CreateUserWithoutPasswordDto.
   * @returns A Promise resolving to the newly created user or an existing user if the email already exists.
   */
  async socialMediaSignup(user: CreateUserWithoutPasswordDto): Promise<User> {
    try {
      const isExist = await this.usersService.findOne(user.email);

      if (isExist) {
        return isExist;
      }
    } catch (error) {}

    //Assign default user role
    const { _id } = await this.rolesService.findOne('user');

    return await this.usersService.create(
      {
        ...user,
      },
      [_id.toString()],
    );
  }
}
