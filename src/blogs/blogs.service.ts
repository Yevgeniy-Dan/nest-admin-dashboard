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

  async findOne(blogId: string): Promise<Blog | Error | undefined> {
    if (!Types.ObjectId.isValid(blogId)) {
      return new BadRequestException('Invalid blogId  format');
    }
    return await this.blogModel.findById(blogId);
  }

  async findAll(userId: string): Promise<Blog[] | undefined> {
    return await this.blogModel.find({
      author: userId,
    });
  }

  async create(blog: CreateBlogDto): Promise<Blog | Error> {
    try {
      const newBlog = new this.blogModel(blog);
      return await newBlog.save();
    } catch (error) {
      return new Error(error);
    }
  }

  async update(blogId: string, blogData: UpdateBlogDto): Promise<Blog | Error> {
    try {
      const blog = await this.blogModel
        .findByIdAndUpdate(blogId, blogData)
        .setOptions({ new: true });

      return blog;
    } catch (error) {
      return new Error(error);
    }
  }

  async delete(blogId: string): Promise<void | Error> {
    const deletedBlog = await this.blogModel.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return new NotFoundException();
    }
  }
}
