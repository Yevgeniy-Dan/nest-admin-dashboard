import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';

import { User } from 'src/users/schemas/user.schema';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @ApiProperty({ required: true, description: 'The blog title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ required: true, description: 'The blog description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    required: false,
    description: 'An array of post IDs associated with the blog',
    type: [String],
  })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    default: [],
  })
  posts: Types.ObjectId[];

  @ApiProperty({
    required: true,
    description: 'The ID of the author',
    type: String,
  })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;

  @ApiProperty({
    required: false,
    description: 'The creation date of the blog',
    type: Date,
  })
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
