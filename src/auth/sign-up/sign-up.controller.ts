import { Controller, Post, Body } from '@nestjs/common';

import { SignUpService } from './sign-up.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Controller('auth/sign-up')
export class SignUpController {
  constructor(private signupService: SignUpService) {}

  @Post()
  signup(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.signupService.signup(createUserDto);
  }
}
