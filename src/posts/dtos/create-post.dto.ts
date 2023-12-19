import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ required: true, description: 'The post title' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ required: true, description: 'The ID of the blog' })
  @IsMongoId()
  @IsNotEmpty()
  readonly blogId: string;

  @ApiProperty({ required: true, description: 'The ID of the photo url' })
  @IsMongoId()
  @IsNotEmpty()
  readonly contentId: string;
}
