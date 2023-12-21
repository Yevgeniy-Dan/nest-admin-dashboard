import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ required: false, description: 'The post title' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly title?: string;

  @ApiProperty({ required: false, description: 'The ID of the blog' })
  @IsMongoId()
  @IsOptional()
  @IsNotEmpty()
  readonly blogId?: string;

  @ApiProperty({ required: true, description: 'The ID of the media url' })
  @IsMongoId()
  @IsOptional()
  @IsNotEmpty()
  readonly contentId?: string;
}
