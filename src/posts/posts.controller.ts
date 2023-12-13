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
    return await this.postService.create(post);
  }

  @Patch('update/post/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async updateBlog(
    @Req() req,
    @Param() { id }: ParamsWithIdDto,
    @Body() post: UpdatePostDto,
  ): Promise<PostSchema | Error> {
    return await this.postService.update(id, post);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('delete/post/:id')
  async deletePost(@Param() { id }: ParamsWithIdDto): Promise<void | Error> {
    return await this.postService.delete(id);
  }
}
