import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3 } from 'aws-sdk';

import { v4 as uuidv4 } from 'uuid';

import { Content } from 'src/content/schemas/content.schema';
import { IConfiguration } from 'src/interfaces/configuration.interface';
import { ContentService } from 'src/content/content.service';

@Injectable()
export class S3Service {
  constructor(
    private readonly configService: ConfigService<IConfiguration>,
    private readonly contentService: ContentService,
  ) {}

  /**
   * Uploads a public file to Amazon S3 and creates a record in the content model.
   * @param schemaName - The name of the schema or directory within the S3 bucket.
   * @param dataBuffer - The buffer containing the file data.
   * @param filename - The original filename of the file.
   * @returns A Promise resolving to the created content object.
   */
  async upload(
    schemaName: string = 'common',
    dataBuffer: Buffer,
    filename: string,
  ): Promise<Content> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get<string>('AWS_BUCKET'),
        ACL: 'public-read',
        Body: dataBuffer,
        Key: `${schemaName}/${uuidv4()}-${filename}`,
      })
      .promise();

    return await this.contentService.create(uploadResult);
  }

  /**
   * Deletes a file from Amazon S3 and removes its record from the content model.
   * @param fileId - The unique identifier of the file in the content model.
   */
  async delete(fileId: string): Promise<void> {
    const file = await this.contentService.findOne(fileId);
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get<string>('AWS_BUCKET'),
        Key: file.key,
      })
      .promise();
    await this.contentService.delete(file.key);
  }
}
