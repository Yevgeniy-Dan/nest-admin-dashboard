import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentController } from './content.controller';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    RolesModule,
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  providers: [ContentService],
  exports: [ContentService, MongooseModule],
  controllers: [ContentController],
})
export class ContentModule {}
