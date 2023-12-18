import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  Query,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { UsersService } from './users.service';

import { User } from './schemas/user.schema';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';
import { ParamsWithIdDto } from './dtos/params-with-id.dto';
import UpdateUserDto from './dtos/user-input.dto';
import { SignUpService } from 'src/auth/sign-up/sign-up.service';
import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/enums/role.enum';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Content } from 'src/content/schemas/content.schema';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private signUpService: SignUpService,
  ) {}

  @Get('user')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUser(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.email);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Get('users')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: [User],
  })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<User[] | Error> {
    return await this.usersService.findAll(page, pageSize);
  }

  @Post('create/user')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto, description: 'User data to create' })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  async createUser(@Body() user: CreateUserDto): Promise<User | Error> {
    return await this.signUpService.signup(user);
  }

  //TODO: define logic when user wants to update password
  @Patch('update/user/:id')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto, description: 'User data to update' })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You do not have permission to update user',
  })
  async updateUser(
    @Req() req,
    @Param() { id }: ParamsWithIdDto,
    @Body() user: UpdateUserDto,
  ): Promise<User | Error> {
    try {
      if (req.user.userId !== id) {
        return new ForbiddenException(
          'You do not have permission to update user',
        );
      }

      const updatedUser: UpdateUserDto = {
        email: user.email,
      };
      return await this.usersService.update(id, updatedUser);
    } catch (error) {
      if (error.code === 11000) {
        return new HttpException('Email is already taken', HttpStatus.CONFLICT);
      } else {
        return new error();
      }
    }
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete('delete/user/:id')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  async deleteUser(@Param() { id }: ParamsWithIdDto): Promise<void | Error> {
    return await this.usersService.delete(id);
  }

  @Post('avatar/user/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Endpoint to upload a new avatar for a user.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file',
    type: 'file',
  })
  @ApiOkResponse({ description: 'Avatar successfully uploaded.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to update the user.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. User not found or avatar file not attached.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async addAvatar(
    @Req() req,
    @Param() { id }: ParamsWithIdDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Content | Error> {
    try {
      if (req.user.userId !== id) {
        return new ForbiddenException(
          'You do not have permission to update user',
        );
      }

      if (!file) {
        return new NotFoundException('You do not attach the photo');
      }
      return this.usersService.addAvatar(
        req.user.userId,
        file.buffer,
        file.originalname,
      );
    } catch (error) {
      return new Error(error);
    }
  }

  @Delete('avatar/user/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Delete user avatar',
    description: 'Endpoint to delete an avatar for a user.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({ description: 'Avatar successfully deleted.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to update the user.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. User or avatar not found.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async deleteAvatar(
    @Req() req,
    @Param() { id }: ParamsWithIdDto,
  ): Promise<User | Error> {
    try {
      if (req.user.userId !== id) {
        return new ForbiddenException(
          'You do not have permission to update user',
        );
      }

      return this.usersService.deleteAvatar(req.user.userId);
    } catch (error) {
      return new Error(error);
    }
  }
}
