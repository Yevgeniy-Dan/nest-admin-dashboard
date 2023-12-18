import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

import { config } from 'aws-sdk';
import { Configuration } from './interfaces/configuration.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Admin Dashboard')
    .setDescription('The admin dashboard API description')
    .setVersion('1.0')
    .addTag('admin-dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const configService: ConfigService<Configuration> = app.get(ConfigService);

  config.update({
    credentials: {
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    },
    region: configService.get<string>('AWS_REGION'),
  });

  await app.listen(3000);
}
bootstrap();
