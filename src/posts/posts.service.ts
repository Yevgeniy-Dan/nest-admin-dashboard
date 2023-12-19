import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Blog } from 'src/blogs/schemas/blog.schema';
import { Content, ContentDocument } from 'src/content/schemas/content.schema';

import * as sharp from 'sharp';
import { ContentService } from 'src/content/content.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
    private contentService: ContentService,
  ) {}

  /**
   * Finds a post by its unique identifier.
   *
   * @param postId - The unique identifier of the post to retrieve.
   * @returns A Promise resolving to the found post if successful, an Error if an exception occurs, or undefined if the post is not found.
   */
  async findOne(postId: string): Promise<Post | Error | undefined> {
    return await this.postModel.findById(postId).populate('photo', 'url');
  }

  /**
   * Finds all posts authored by the specified user.
   *
   * @param userId - The unique identifier of the user whose posts are to be retrieved.
   * @returns A Promise resolving to an array of posts authored by the specified user, or undefined if no posts are found.
   */
  async findAll(userId: string): Promise<Post[] | undefined> {
    return await this.postModel
      .find({
        author: userId,
      })
      .populate('photo', 'url');
  }

  /**
   * Creates a new post and associates it with an existing blog.
   *
   * @param post - The data of the post to be created, provided as a CreatePostDto.
   * @returns A Promise resolving to the newly created post if successful, or an Error (NotFoundException) if the associated blog is not found.
   */
  async create(userId: string, post: CreatePostDto): Promise<Post | Error> {
    const existingBlog = await this.blogModel.findById(post.blogId);
    if (!existingBlog) {
      return new NotFoundException('Blog not found');
    }

    if (existingBlog._id.toString() !== userId) {
      return new ForbiddenException();
    }

    const newPost = new this.postModel({
      title: post.title,
      photo: post.contentId,
    });

    existingBlog.posts.push(newPost._id);

    await existingBlog.save();
    return await newPost.save();
  }

  /**
   * Updates a post with the specified data, optionally changing its associated blog.
   *
   * @param postId - The unique identifier of the post to be updated.
   * @param postData - The data to be updated in the post, provided as an UpdatePostDto.
   * @returns A Promise resolving to the updated post if successful, or an Error (NotFoundException) if a referenced blog is not found or an exception occurs during the update process.
   */
  async update(
    userId: string,
    postId: string,
    postData: UpdatePostDto,
  ): Promise<Post | Error> {
    try {
      const updatedPost = await this.postModel.findById(postId);

      if (postData.blogId) {
        const existingBlog = await this.blogModel.findById(postData.blogId);
        if (!existingBlog) {
          return new NotFoundException('Blog not found');
        }

        if (existingBlog._id.toString() !== userId) {
          return new ForbiddenException();
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

      const post = await this.postModel
        .findByIdAndUpdate(postId, {
          title: postData.title,
          photo: postData.contentId,
        })
        .setOptions({ new: true });

      //Delete post photo from the storage
      await this.deletePostPhoto(post._id.toString());

      return post;
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
      //Delete post photo from the storage
      await this.deletePostPhoto(postId);

      //Delete post
      await this.postModel.findByIdAndDelete(postId);

      // Remove the old post ID from the blog.posts array
      const blog = await this.blogModel.findOne({ posts: postId });

      blog.posts = blog.posts.filter((id) => id.toString() !== postId);

      await blog.save();
    } catch (error) {
      return new Error(error);
    }
  }

  async addPostPhoto(
    imageBuffer: Buffer,
    filename: string,
  ): Promise<Content | Error> {
    try {
      // Resize the post photo using Sharp with the following parameters:
      // - Target size: 4096x4096 pixels
      // - Fit strategy: Keep the aspect ratio and fit the image inside the specified dimensions
      // - Without enlargement: Prevent enlarging the image if its dimensions are already smaller
      const resizedPostBuffer = await sharp(imageBuffer)
        .resize(4096, 4096, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toBuffer();

      return await this.contentService.upload(
        'posts',
        resizedPostBuffer,
        filename,
      );
    } catch (error) {
      return new Error('Failed to add post photo');
    }
  }

  private async deletePostPhoto(postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    const { _id: fileId } = post.photo as ContentDocument;

    await this.contentService.delete(fileId.toString());
  }
}
