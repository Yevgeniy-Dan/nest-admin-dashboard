import { ApiProperty } from '@nestjs/swagger';

import { IsMongoId } from 'class-validator';

export class ParamsWithIdDto {
  @ApiProperty({ required: true, description: 'The id' })
  @IsMongoId()
  id: string;
}
