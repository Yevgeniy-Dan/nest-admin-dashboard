import {
  Controller,
  Body,
  Delete,
  Get,
  Req,
  Patch,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import { Post as PostSchema } from './schemas/post.schema';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/enums/role.enum';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Content } from 'src/content/schemas/content.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * A short note on creating posts. In the current implementation, posts
 * cannot exist without media. Therefore, the process of creating a post from
 * the client side is as follows.
 *
 * The client uploads media to storage c3 using the 'photo/post' route.
 * Afterwards, it receives the Content entity and creates a post along the
 * 'create/post' route with the corresponding DTO.
 *
 * To update a post, he must again upload a photo and only then add a link to
 * it through the update method.
 *
 * Thus, he cannot independently delete photos from posts and therefore there
 * is no separate endpoint for this, unlike uploading and deleting an avatar
 */
@Controller('')
export class PostsController {
  constructor(private postService: PostsService) {}
  //TODO: ExistsInDatabase

  @Get('post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async getPost(@Body() { id }: ParamsWithIdDto): Promise<PostSchema | Error> {
    return this.postService.findOne(id);
  }

  @Get('posts')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async getAllPosts(@Req() req): Promise<PostSchema[] | Error> {
    return await this.postService.findAll(req.user.userId);
  }

  @Post('create/post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async createPost(
    @Req() req,
    @Body() post: CreatePostDto,
  ): Promise<PostSchema | Error> {
    return await this.postService.create(req.user.userId, post);
  }

  @Patch('update/post/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async updateBlog(
    @Req() req,
    @Param() { id }: ParamsWithIdDto,
    @Body() post: UpdatePostDto,
  ): Promise<PostSchema | Error> {
    return await this.postService.update(req.user.userId, id, post);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('delete/post/:id')
  async deletePost(@Param() { id }: ParamsWithIdDto): Promise<void | Error> {
    return await this.postService.delete(id);
  }

  @Post('photo/post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload post photo',
    description: 'Endpoint to upload a new post photo.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Post photo file',
    type: 'file',
  })
  @ApiOkResponse({ description: 'Photo successfully uploaded.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({
    description: 'Not Found. You do not attach the post photo.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async addPostPhoto(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ): Promise<Content | Error> {
    try {
      if (!file) {
        return new NotFoundException('You do not attach the post photo');
      }

      return this.postService.addPostPhoto(file.buffer, file.originalname);
    } catch (error) {
      return new Error(error);
    }
  }
}
