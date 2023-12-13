import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

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
}

export const PostSchema = SchemaFactory.createForClass(Post);
