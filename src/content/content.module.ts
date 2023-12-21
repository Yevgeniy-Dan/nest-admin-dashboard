import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ContentService } from './content.service';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentController } from './content.controller';
import { RolesModule } from 'src/roles/roles.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    RolesModule,
    forwardRef(() => S3Module),
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  providers: [ContentService],
  exports: [ContentService, MongooseModule],
  controllers: [ContentController],
})
export class ContentModule {}
