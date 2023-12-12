import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ required: true, description: 'The blog title' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ required: true, description: 'The blog description' })
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty({ required: true, description: 'The ID of the author' })
  @IsMongoId()
  @IsNotEmpty()
  readonly author: string;
}
