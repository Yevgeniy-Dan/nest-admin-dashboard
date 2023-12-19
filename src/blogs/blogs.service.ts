import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schema';
import { Model, Types } from 'mongoose';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}

  /**
   * Finds a blog by its unique identifier.
   *
   * @param blogId - The unique identifier of the blog to retrieve.
   * @returns A Promise resolving to the found blog if successful, an Error if the blogId format is invalid, or undefined if the blog is not found.
   */
  async findOne(blogId: string): Promise<Blog> {
    if (!Types.ObjectId.isValid(blogId)) {
      throw new BadRequestException('Invalid blogId  format');
    }

    const blog = await this.blogModel.findById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  /**
   * Finds all blogs authored by the specified user.
   *
   * @param userId - The unique identifier of the user whose blogs are to be retrieved.
   * @returns A Promise resolving to an array of blogs authored by the specified user, or undefined if no blogs are found.
   */
  async findAll(userId: string): Promise<Blog[]> {
    return await this.blogModel.find({
      author: userId,
    });
  }

  /**
   * Creates a new blog post for the specified user.
   *
   * @param blog - The data of the blog post to be created, provided as a CreateBlogDto.
   * @param userId - The unique identifier of the user creating the blog post.
   * @returns A Promise resolving to the newly created blog post if successful, or an Error if an exception occurs during the creation process.
   */
  async create(blog: CreateBlogDto, userId: string): Promise<Blog> {
    const newBlog = new this.blogModel({
      ...blog,
      author: userId,
    });
    return await newBlog.save();
  }

  /**
   * Updates a blog post with the specified data.
   *
   * @param blogId - The unique identifier of the blog post to be updated.
   * @param blogData - The data to be updated in the blog post, provided as an UpdateBlogDto.
   * @returns A Promise resolving to the updated blog post if successful, or an Error if an exception occurs during the update process.
   */
  async update(blogId: string, blogData: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogModel
      .findByIdAndUpdate(blogId, {
        description: blogData.description,
        title: blogData.title,
      })
      .setOptions({ new: true });

    return blog;
  }

  /**
   * Deletes a blog post with the specified blogId.
   *
   * @param blogId - The unique identifier of the blog post to be deleted.
   * @returns A Promise resolving to void if the deletion is successful, or an Error (NotFoundException) if the blog post is not found.
   */
  async delete(blogId: string): Promise<void> {
    const deletedBlog = await this.blogModel.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      throw new NotFoundException('Blog not found');
    }
  }
}
