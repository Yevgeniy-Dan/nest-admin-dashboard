import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dtos/user-response.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(email);

    const validPassword = await bcrypt.compare(password, user.password);

    if (user && validPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
