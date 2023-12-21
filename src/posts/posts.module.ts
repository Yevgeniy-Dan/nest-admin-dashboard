import { Module, forwardRef } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Post, PostSchema } from './schemas/post.schema';
import { BlogsModule } from 'src/blogs/blogs.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    BlogsModule,
    forwardRef(() => S3Module),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, MongooseModule],
})
export class PostsModule {}
