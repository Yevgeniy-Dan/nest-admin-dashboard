import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

import * as path from 'path';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  private allowedExtensions: string[];

  constructor(allowedExtensions: string[]) {
    this.allowedExtensions = allowedExtensions;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided');
    }

    const fileExtension = path.extname(value.originalname).toLowerCase();

    const isValid = this.allowedExtensions.includes(fileExtension);

    if (!isValid) {
      throw new BadRequestException(
        `File type now allowed. Allowed types: ${this.allowedExtensions.join(
          ',',
        )}`,
      );
    }

    return value;
  }
}
