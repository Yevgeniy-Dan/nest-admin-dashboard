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
import { CreateUserWithPasswordDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Content } from 'src/content/schemas/content.schema';
import { RolesService } from 'src/roles/roles.service';
import { IRequestWithUserPayload } from 'src/interfaces/request.interface';
import { FileTypeValidationPipe } from 'src/pipes/file-type-validation.pipe';
import { AssignRoleParamsDto } from './dtos/assign-role.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller()
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
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
  async getUser(@Req() req: IRequestWithUserPayload): Promise<User> {
    return await this.usersService.findOne(req.user.email);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Get('users')
  @Roles('user')
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
  ): Promise<User[]> {
    return await this.usersService.findAll(page, pageSize);
  }

  @Post('create/user')
  @UseGuards(RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserWithPasswordDto,
    description: 'User data to create',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async createUser(@Body() user: CreateUserWithPasswordDto): Promise<User> {
    return await this.signUpService.nativeSignup(user);
  }

  @Patch('update/user/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
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
    @Req() req: IRequestWithUserPayload,
    @Param() { id }: ParamsWithIdDto,
    @Body() user: UpdateUserDto,
  ): Promise<User> {
    try {
      const roleNames = await this.rolesService.findByIds(req.user.roles);

      if (req.user.userId === id || roleNames.includes('admin')) {
        const updatedUser: UpdateUserDto = {
          email: user.email,
        };
        return await this.usersService.update(id, updatedUser);
      }

      throw new ForbiddenException('You do not have permission to update user');
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Email is already taken', HttpStatus.CONFLICT);
      } else {
        throw new Error(error);
      }
    }
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('delete/user/:id')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({ description: 'User is successfully deleted.' })
  async deleteUser(@Param() { id }: ParamsWithIdDto): Promise<void> {
    return await this.usersService.delete(id);
  }

  @Post('avatar/user/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
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
    @Req() req: IRequestWithUserPayload,
    @Param() { id }: ParamsWithIdDto,
    @UploadedFile(new FileTypeValidationPipe(['.jpg', '.png', '.svg']))
    file: Express.Multer.File,
  ): Promise<Content> {
    if (req.user.userId !== id) {
      throw new ForbiddenException('You do not have permission to update user');
    }

    if (!file) {
      throw new NotFoundException('You do not attach the photo');
    }
    return this.usersService.addAvatar(
      req.user.userId,
      file.buffer,
      file.originalname,
    );
  }

  @Delete('avatar/user/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
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
  @ApiOkResponse({
    description: 'Avatar is successfully deleted.',
    type: User,
  })
  async deleteAvatar(
    @Req() req: IRequestWithUserPayload,
    @Param() { id }: ParamsWithIdDto,
  ): Promise<User> {
    if (req.user.userId !== id) {
      throw new ForbiddenException('You do not have permission to update user');
    }

    return this.usersService.deleteAvatar(req.user.userId);
  }

  @Patch('update/user-assign-role')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user role' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiBody({
    type: AssignRoleParamsDto,
    description: 'User and role id for updating',
  })
  @ApiOkResponse({
    description: 'User roles in user profile updated successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You do not have permission to update user roles',
  })
  @ApiBadRequestResponse({
    description: 'User aldready have the role',
  })
  async assignRole(
    @Body() { roleId, userId }: AssignRoleParamsDto,
  ): Promise<User> {
    return await this.rolesService.assignRole(roleId, userId);
  }
}
