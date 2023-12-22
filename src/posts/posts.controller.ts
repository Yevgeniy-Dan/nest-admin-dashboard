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
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import { Post as PostSchema } from './schemas/post.schema';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Content } from 'src/content/schemas/content.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IRequestWithUserPayload } from 'src/interfaces/request.interface';
import { FileTypeValidationPipe } from 'src/pipes/file-type-validation.pipe';

/**
 * A short note on creating posts. In the current implementation, posts
 * cannot exist without media. Therefore, the process of creating a post from
 * the client side is as follows.
 *
 * The client uploads media to storage s3 using the 'media/post' route.
 * Afterwards, it receives the Content entity and creates a post along the
 * 'create/post' route with the corresponding DTO.
 *
 * To update a post, he must again upload a media and only then add a link to
 * it through the update method.
 *
 * Thus, he cannot independently delete media from posts and therefore there
 * is no separate endpoint for this, unlike uploading and deleting an avatar
 */
@ApiTags('Posts')
@ApiBearerAuth()
@Controller()
export class PostsController {
  constructor(private postService: PostsService) {}
  //TODO: ExistsInDatabase

  @Get('post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Get a post by ID',
    description: 'Retrieve a post by its ID.',
  })
  @ApiBody({ type: ParamsWithIdDto, description: 'Post ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved post.',
    type: Post,
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPost(@Body() { id }: ParamsWithIdDto): Promise<PostSchema> {
    return this.postService.findOne(id);
  }

  @Get('posts')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Get all posts',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Posts successfully retrieved.',
    type: [Post],
  })
  @ApiNotFoundResponse({ description: 'Posts not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAllPosts(
    @Req() req: IRequestWithUserPayload,
  ): Promise<PostSchema[]> {
    return await this.postService.findAll(req.user.userId);
  }

  @Post('create/post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Create post',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiBody({ type: CreatePostDto, description: 'Post data to create' })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: Post,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createPost(
    @Req() req: IRequestWithUserPayload,
    @Body() post: CreatePostDto,
  ): Promise<PostSchema> {
    return await this.postService.create(req.user.userId, post);
  }

  @Patch('update/post/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Update post',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: UpdatePostDto, description: 'Post data to update' })
  @ApiOkResponse({
    description: 'Post updated successfully',
    type: Post,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateBlog(
    @Req() req: IRequestWithUserPayload,
    @Param() { id }: ParamsWithIdDto,
    @Body() post: UpdatePostDto,
  ): Promise<PostSchema> {
    return await this.postService.update(req.user.userId, id, post);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @Delete('delete/post/:id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'Post is successfully deleted.' })
  async deletePost(@Param() { id }: ParamsWithIdDto): Promise<void> {
    return await this.postService.delete(id);
  }

  @Post('media/post')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload post media',
    description: 'Endpoint to upload a new post media.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Post media file',
    type: 'file',
  })
  @ApiOkResponse({ description: 'Photo successfully uploaded.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({
    description: 'Not Found. You do not attach the post media.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async addPostMedia(
    @UploadedFile(new FileTypeValidationPipe(['.jpg', '.png', '.svg', '.mp4']))
    file: Express.Multer.File,
  ): Promise<Content> {
    if (!file) {
      throw new NotFoundException('You do not attach the post media file');
    }

    return this.postService.addPostMedia(file.buffer, file.originalname);
  }
}
