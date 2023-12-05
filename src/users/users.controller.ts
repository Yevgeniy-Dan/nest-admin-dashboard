import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { UsersService } from './users.service';

// import { IJwtTokenResponse } from 'src/interfaces/token.interface';
import { JwtTokenResponseDto } from 'src/auth/dtos/jwt-token-response.dto';
import { User } from './schemas/user.schema';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Get('user')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: JwtTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async user(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.email);
  }
}
