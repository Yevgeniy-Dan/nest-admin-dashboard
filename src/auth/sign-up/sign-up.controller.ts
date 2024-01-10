import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SignUpService } from './sign-up.service';

import { CreateUserWithPasswordDto } from './dtos/create-user.dto';
import { User } from 'src/users/schemas/user.schema';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

@ApiTags('Authentication')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
@Controller('auth/sign-up')
export class SignUpController {
  constructor(private signupService: SignUpService) {}

  @Post()
  @ApiOperation({ summary: 'User sign-up' })
  @ApiCreatedResponse({
    description: 'User successfully signed up',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async signup(
    @Body() createUserDto: CreateUserWithPasswordDto,
  ): Promise<User> {
    return this.signupService.nativeSignup(createUserDto);
  }
}
