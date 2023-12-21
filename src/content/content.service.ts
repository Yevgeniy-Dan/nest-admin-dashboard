import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3 } from 'aws-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content } from './schemas/content.schema';
import { IConfiguration } from 'src/interfaces/configuration.interface';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    private readonly configService: ConfigService<IConfiguration>,
  ) {}

  /**
   * Find a content item by its unique identifier.
   *
   * @param contentId The unique identifier of the content item to find.
   * @returns A Promise resolving to the found Content item.
   */
  async findOne(contentId: string): Promise<Content> {
    return await this.contentModel.findById(contentId);
  }

  /**
   * Create a new Content item using the provided S3 upload result.
   *
   * @param uploadResult The S3 upload result containing information about the uploaded file.
   * @returns A Promise resolving to the newly created Content item.
   */
  async create(uploadResult: S3.ManagedUpload.SendData): Promise<Content> {
    const newFile = new this.contentModel({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });

    return await newFile.save();
  }

  /**
   * Delete a Content item based on the provided file key.
   *
   * @param fileKey The unique key associated with the file to be deleted.
   * @returns A Promise resolving to void.
   */
  async delete(fileKey: string): Promise<void> {
    await this.contentModel.deleteOne({ key: fileKey });
  }
}
