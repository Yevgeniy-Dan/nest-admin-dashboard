import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { IUser } from 'src/users/interfaces/user.interface';
import { SignUpService } from './sign-up.service';

@Controller('sign-up')
export class SignUpController {
  constructor(private signupService: SignUpService) {}

  @Post()
  signup(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.signupService.signup(createUserDto);
  }
}
