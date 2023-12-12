import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Blog } from './schemas/blog.schema';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/enums/role.enum';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('')
export class BlogsController {
  constructor(private blogService: BlogsService) {}
  @Get('blog')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async getBlog(@Body() { id }: ParamsWithIdDto): Promise<Blog | Error> {
    return this.blogService.findOne(id);
  }

  /**
   * It is taken into account that the request to find all blogs
   * is made taking into account the current user. That is,
   * the array is returned not of absolutely all blogs, but
   * of all blogs of the current user
   */
  @Get('blogs')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async getAllBlogs(@Req() req): Promise<Blog[] | Error> {
    return await this.blogService.findAll(req.user.userId);
  }

  @Post('create/blog')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async createBlog(
    @Req() req,
    @Body() blog: CreateBlogDto,
  ): Promise<Blog | Error> {
    if (req.user.userId !== blog.author) {
      return new ForbiddenException(
        'You do not have permission to create blog. User IDs do not match',
      );
    }

    return await this.blogService.create(blog);
  }

  @Patch('update/blog/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  async updateBlog(
    @Param() { id }: ParamsWithIdDto,
    @Body() blog: UpdateBlogDto,
  ): Promise<Blog | Error> {
    try {
      //TODO: req.user.userId === blog.author
      return await this.blogService.update(id, blog);
    } catch (error) {
      return new error();
    }
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('delete/blog/:id')
  async deleteBlog(@Param() { id }: ParamsWithIdDto): Promise<void | Error> {
    //TODO: req.user.userId === blog.author
    return await this.blogService.delete(id);
  }
}
