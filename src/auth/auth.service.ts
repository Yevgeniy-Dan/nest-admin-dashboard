import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);

    const validPassword = await bcrypt.compare(password, user.password);

    if (user && validPassword) {
      return user;
    }

    return null;
  }
}
