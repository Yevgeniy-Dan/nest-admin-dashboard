import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

import { Content } from './schemas/content.schema';
import { Configuration } from 'src/interfaces/configuration.interface';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  /**
   * Uploads a public file to Amazon S3 and creates a record in the content model.
   * @param dataBuffer - The buffer containing the file data.
   * @param filename - The original filename of the file.
   * @returns A Promise resolving to the created content object.
   */
  async upload(dataBuffer: Buffer, filename: string): Promise<Content> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get<string>('AWS_BUCKET'),
        ACL: 'public-read',
        Body: dataBuffer,
        Key: `${uuidv4()}-${filename}`,
      })
      .promise();

    const newFile = new this.contentModel({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });

    await newFile.save();
    return newFile;
  }

  async delete(fileId: string): Promise<void> {
    const file = await this.contentModel.findById(fileId);
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get<string>('AWS_BUCKET'),
        Key: file.key,
      })
      .promise();
    await this.contentModel.deleteOne({ key: file.key });
  }
}
