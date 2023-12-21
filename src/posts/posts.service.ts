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
import * as path from 'path';
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
  async findOne(postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId).populate('media', 'url');

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return post;
  }

  /**
   * Finds all posts authored by the specified user.
   *
   * @param userId - The unique identifier of the user whose posts are to be retrieved.
   * @returns A Promise resolving to an array of posts authored by the specified user, or undefined if no posts are found.
   */
  async findAll(userId: string): Promise<Post[]> {
    return await this.postModel
      .find({
        author: userId,
      })
      .populate('media', 'url');
  }

  /**
   * Creates a new post and associates it with an existing blog.
   *
   * @param post - The data of the post to be created, provided as a CreatePostDto.
   * @returns A Promise resolving to the newly created post if successful.
   */
  async create(userId: string, post: CreatePostDto): Promise<Post> {
    const existingBlog = await this.blogModel.findById(post.blogId);
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (existingBlog._id.toString() !== userId) {
      throw new ForbiddenException();
    }

    const newPost = new this.postModel({
      title: post.title,
      media: post.contentId,
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
  ): Promise<Post> {
    const updatedPost = await this.postModel.findById(postId);

    if (postData.blogId) {
      const existingBlog = await this.blogModel.findById(postData.blogId);
      if (!existingBlog) {
        throw new NotFoundException('Blog not found');
      }

      if (existingBlog._id.toString() !== userId) {
        throw new ForbiddenException();
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
        media: postData.contentId,
      })
      .setOptions({ new: true });

    //Delete post media from the storage
    await this.deletePostPhoto(post._id.toString());

    return post;
  }

  /**
   * Deletes a post and removes its ID from the associated blog's posts array using a MongoDB transaction.
   * @param postId - The ID of the post to be deleted.
   * @returns Promise<void>
   */
  async delete(postId: string): Promise<void> {
    //Delete post media from the storage
    await this.deletePostPhoto(postId);

    //Delete post
    await this.postModel.findByIdAndDelete(postId);

    // Remove the old post ID from the blog.posts array
    const blog = await this.blogModel.findOne({ posts: postId });

    blog.posts = blog.posts.filter((id) => id.toString() !== postId);

    await blog.save();
  }

  /**
   * Adds media content (image or non-image) to a post.
   * If the media is an image (JPG, PNG, SVG), it is resized using Sharp before uploading.
   *
   * @param mediaBuffer - Buffer containing the media data.
   * @param filename - The name of the file, including its extension.
   * @returns A Promise resolving to the uploaded Content.
   */
  async addPostMedia(mediaBuffer: Buffer, filename: string): Promise<Content> {
    const extension = path.extname(filename).toLowerCase();
    const isImage = ['jpg', 'png', 'svg'].includes(extension);

    if (isImage) {
      return await this.uploadResizedImage(mediaBuffer, filename);
    } else {
      return await this.contentService.upload('posts', mediaBuffer, filename);
    }
  }

  /**
   * Uploads a resized image to the 'posts' content service.
   *
   * @param imageBuffer - Buffer containing the original image data.
   * @param filename - The name of the image file, including its extension.
   * @returns A Promise resolving to the uploaded Content.
   */
  private async uploadResizedImage(
    imageBuffer: Buffer,
    filename: string,
  ): Promise<Content> {
    const resizedPostBuffer = await this.resizeImage(imageBuffer);
    return await this.contentService.upload(
      'posts',
      resizedPostBuffer,
      filename,
    );
  }

  /**
   * Resizes an image using Sharp with specified parameters.
   *
   * @param imageBuffer - Buffer containing the original image data.
   * @returns A Promise resolving to the resized image buffer.
   */
  private async resizeImage(imageBuffer: Buffer): Promise<Buffer> {
    // Resize the post media using Sharp with the following parameters:
    // - Target size: 4096x4096 pixels
    // - Fit strategy: Keep the aspect ratio and fit the image inside the specified dimensions
    // - Without enlargement: Prevent enlarging the image if its dimensions are already smaller
    return await sharp(imageBuffer)
      .resize(4096, 4096, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  /**
   * Deletes the media associated with a post.
   *
   * @param postId - The identifier of the post whose media needs to be deleted.
   * @returns A Promise that resolves once the media is successfully deleted.
   */
  private async deletePostPhoto(postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    const { _id: fileId } = post.media as ContentDocument;

    await this.contentService.delete(fileId.toString());
  }
}
