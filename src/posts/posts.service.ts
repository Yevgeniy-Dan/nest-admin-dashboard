import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Blog } from 'src/blogs/schemas/blog.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}

  async findOne(postId: string): Promise<Post | Error | undefined> {
    return await this.postModel.findById(postId);
  }

  async findAll(userId: string): Promise<Post[] | undefined> {
    return await this.postModel.find({
      author: userId,
    });
  }

  async create(post: CreatePostDto): Promise<Post | Error> {
    const existingBlog = await this.blogModel.findById(post.blogId);
    if (!existingBlog) {
      return new NotFoundException('Blog not found');
    }

    const newPost = new this.postModel({
      title: post.title,
    });

    existingBlog.posts.push(newPost._id);

    await existingBlog.save();
    return await newPost.save();
  }

  async update(postId: string, postData: UpdatePostDto): Promise<Post | Error> {
    try {
      const updatedPost = await this.postModel.findById(postId);

      if (postData.blogId) {
        const existingBlog = await this.blogModel.findById(postData.blogId);
        if (!existingBlog) {
          return new NotFoundException('Blog not found');
        }

        //The order of insertion and deletion matters

        // Remove the old post ID from the blog.posts array
        const oldBlog = await this.blogModel.findOne({ posts: postId });
        oldBlog.posts = oldBlog.posts.filter((id) => id.toString() !== postId);
        await oldBlog.save();

        // Add the new post ID to existingBlog.posts
        existingBlog.posts.push(updatedPost._id);
        await existingBlog.save();
      }

      updatedPost.title = postData.title;

      // Save the updated post
      const savedPost = await updatedPost.save();

      return savedPost;
    } catch (error) {
      return new Error(error);
    }
  }

  /**
   * Deletes a post and removes its ID from the associated blog's posts array using a MongoDB transaction.
   * @param postId - The ID of the post to be deleted.
   * @returns Promise<void | Error>
   */
  async delete(postId: string): Promise<void | Error> {
    try {
      await this.postModel.findByIdAndDelete(postId);

      // Remove the old post ID from the blog.posts array
      const blog = await this.blogModel.findOne({ posts: postId });

      console.log(blog);

      blog.posts = blog.posts.filter((id) => id.toString() !== postId);

      console.log(blog);

      await blog.save();
    } catch (error) {
      return new Error(error);
    }
  }
}
