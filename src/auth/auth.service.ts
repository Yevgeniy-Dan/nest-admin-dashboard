import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  /**
   * Validates a user by checking the provided email and password against stored user credentials.
   * @param email - The email address of the user.
   * @param password - The password to be validated.
   * @returns A Promise resolving to the User object if validation is successful, or null if validation fails.
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);

    const validPassword = await bcrypt.compare(password, user.password);

    if (user && validPassword) {
      return user;
    }

    return null;
  }
}
