import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @ApiProperty({ required: false, description: 'The blog ID' })
  @Transform(({ value }) => value.toString())
  _id?: string;

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
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }], default: [] })
  posts: string[];

  @ApiProperty({
    required: true,
    description: 'The ID of the author',
    type: String,
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: string;

  @ApiProperty({
    required: false,
    description: 'The creation date of the blog',
    type: Date,
  })
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
