import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SignUpService } from './sign-up.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@ApiTags('Authentication')
@Controller('auth/sign-up')
export class SignUpController {
  constructor(private signupService: SignUpService) {}

  @Post()
  @ApiOperation({ summary: 'User sign-up' })
  @ApiCreatedResponse({
    description: 'User successgully signed up',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  signup(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.signupService.signup(createUserDto);
  }
}
