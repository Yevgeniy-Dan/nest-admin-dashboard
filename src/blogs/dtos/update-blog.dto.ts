import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({ required: false, description: 'The blog title' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly title?: string;

  @ApiProperty({ required: false, description: 'The blog description' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly description?: string;
}
