import { Injectable, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class SignUpService {
  constructor(private usersService: UsersService) {}

  async signup(user: CreateUserDto): Promise<User> {
    const isExist = await this.usersService.findOne(user.email);

    if (isExist) {
      throw new HttpException(
        `User with email ${user.email} already exists.`,
        500,
      );
    }

    const password = await bcrypt.hash(user.password, 10);

    //TODO: assign default 'User' role
    return await this.usersService.create({
      ...user,
      password,
    });
  }
}
