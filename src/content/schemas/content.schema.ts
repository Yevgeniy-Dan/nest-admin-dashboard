import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type ContentDocument = HydratedDocument<Content>;

@Schema()
export class Content {
  @ApiProperty({ required: true, description: 'The url of content in AWS S3' })
  @Prop({ required: true })
  url: string;

  @ApiProperty({
    required: true,
    description: 'Key identifier of the file in the C3 AWS S3 bucket',
  })
  @Prop({ required: true })
  key: string;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
