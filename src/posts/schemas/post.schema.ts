import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

import * as mongoose from 'mongoose';
import { Content } from 'src/content/schemas/content.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @ApiProperty({ required: true, description: 'The post title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    required: false,
    description: 'The creation date of the post',
    type: Date,
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    required: true,
    description: 'The post media ref',
    type: String,
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  })
  media: Content;
}

export const PostSchema = SchemaFactory.createForClass(Post);
