import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { UsersService } from './users.service';

import { IUser } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Get('profile')
  getMe(@Req() req): IUser {
    return req.user;
  }
}
