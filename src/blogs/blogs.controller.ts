import {
  Body,
  Controller,
  Delete,
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
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import {
  ApiBearerAuth,
  ApiBody,
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

@ApiTags('Blogs')
@ApiBearerAuth()
@Controller()
export class BlogsController {
  constructor(private blogService: BlogsService) {}
  @Get('blog')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Get a blog by ID',
    description: 'Retrieve a blog by its ID.',
  })
  @ApiBody({ type: ParamsWithIdDto, description: 'Blog ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved blog.',
    type: Blog,
  })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getBlog(@Body() { id }: ParamsWithIdDto): Promise<Blog> {
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
  @Roles('user')
  @ApiOperation({
    summary: 'Get all blogs',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Blogs successfully retrieved.',
    type: [Blog],
  })
  @ApiNotFoundResponse({ description: 'Blogs not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAllBlogs(@Req() req: IRequestWithUserPayload): Promise<Blog[]> {
    return await this.blogService.findAll(req.user.userId);
  }

  @Post('create/blog')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Create blog',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiBody({ type: CreateBlogDto, description: 'Blog data to create' })
  @ApiCreatedResponse({
    description: 'Blog created successfully',
    type: Blog,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createBlog(
    @Req() req: IRequestWithUserPayload,
    @Body() blog: CreateBlogDto,
  ): Promise<Blog> {
    return await this.blogService.create(blog, req.user.userId);
  }

  @Patch('update/blog/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({
    summary: 'Update blog',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiBody({ type: UpdateBlogDto, description: 'Blog data to update' })
  @ApiOkResponse({
    description: 'Blog updated successfully',
    type: Blog,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateBlog(
    @Param() { id }: ParamsWithIdDto,
    @Body() blog: UpdateBlogDto,
  ): Promise<Blog> {
    //TODO: req.user.userId === blog.author
    return await this.blogService.update(id, blog);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('user')
  @Delete('delete/blog/:id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'Blog is successfully deleted.' })
  async deleteBlog(@Param() { id }: ParamsWithIdDto): Promise<void> {
    //TODO: req.user.userId === blog.author
    return await this.blogService.delete(id);
  }
}
