import { Module, forwardRef } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ContentModule } from 'src/content/content.module';

@Module({
  imports: [forwardRef(() => ContentModule)],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
