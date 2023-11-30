import { Injectable, HttpException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/interfaces/user.interface';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class SignUpService {
  constructor(private usersService: UsersService) {}

  async signup(user: CreateUserDto): Promise<IUser> {
    const isExist = await this.usersService.findUserByEmail(user.email);

    if (isExist) {
      throw new HttpException(
        `User with email ${user.email} already exists.`,
        500,
      );
    }

    const password = await bcrypt.hash(user.password, 10);

    return await this.usersService.create({
      ...user,
      password,
    });
  }
}
