import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from 'src/auth/sign-up/dtos/create-user.dto';
import { User } from './schemas/user.schema';
import UpdateUserDto from './dtos/user-input.dto';
import { ContentService } from 'src/content/content.service';
import { Content, ContentDocument } from 'src/content/schemas/content.schema';

import * as sharp from 'sharp';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private contentService: ContentService,
  ) {}

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to retrieve.
   * @returns A Promise resolving to the found user if successful, or undefined if the user is not found.
   */
  async findOne(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      email,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  /**
   * Retrieves a paginated list of users.
   *
   * @param page - The page number of the paginated results (default is 1).
   * @param pageSize - The number of users to include per page (default is 10).
   * @returns A Promise resolving to an array of users for the specified page, or undefined if no users are found.
   */
  async findAll(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<User[] | undefined> {
    const skip = (page - 1) * pageSize;
    return await this.userModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .populate('roles', 'role')
      .exec();
  }

  /**
   * Creates a new user with the provided data.
   *
   * @param user - The data of the user to be created, provided as a CreateUserDto.
   * @returns A Promise resolving to the newly created user.
   */
  async create(user: CreateUserDto, roles: string[]): Promise<User> {
    const newUser = new this.userModel({
      ...user,
      roles,
    });
    return await newUser.save();
  }

  /**
   * Updates user information with the specified data.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param userData - The data to be updated in the user, provided as an UpdateUserDto.
   * @returns A Promise resolving to the updated user if successful, or an Error (NotFoundException) if the user is not found.
   */
  async update(userId: string, userData: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, {
        email: userData.email,
      })
      .setOptions({ new: true });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  /**
   * Deletes a user with the specified userId.
   *
   * @param userId - The unique identifier of the user to be deleted.
   * @returns A Promise resolving to void if the deletion is successful, or an Error (NotFoundException) if the user is not found.
   */
  async delete(userId: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundException();
    }
  }

  /**
   * Uploads a user avatar to Amazon S3, associates it with the specified user, and returns the uploaded content object.
   * @param userId - The ID of the user for whom the avatar is being uploaded.
   * @param imageBuffer - The buffer containing the avatar image data.
   * @param filename - The original filename of the avatar image.
   * @returns A Promise resolving to the uploaded content object or an error (e.g., NotFoundException)
   */
  async addAvatar(
    userId: string,
    imageBuffer: Buffer,
    filename: string,
  ): Promise<Content> {
    // Resize the avatar image using Sharp with the following parameters:
    // - Target size: 200x200 pixels
    // - Fit strategy: Keep the aspect ratio and fit the image inside the specified dimensions
    // - Without enlargement: Prevent enlarging the image if its dimensions are already smaller
    const resizedAvatarBuffer = await sharp(imageBuffer)
      .resize(200, 200, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();

    const avatar = await this.contentService.upload(
      'avatars',
      resizedAvatarBuffer,
      filename,
    );
    const user = await this.userModel
      .findByIdAndUpdate(userId, {
        avatar,
      })
      .setOptions({ new: true });

    if (!user) {
      throw new NotFoundException();
    }

    return avatar;
  }

  /**
   * Deletes the avatar of a user, removes the reference from the user document,
   * and deletes the corresponding file from the storage.
   * @param userId - The ID of the user.
   * @returns A Promise resolving to the updated user without the avatar or an Error if the avatar or user is not found.
   */
  async deleteAvatar(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    const { _id: fileId } = user.avatar as ContentDocument;

    if (fileId) {
      user.avatar = null;

      await user.save();
      await this.contentService.delete(fileId.toString());

      console.log(user);
      return user;
    }

    throw new NotFoundException();
  }
}
