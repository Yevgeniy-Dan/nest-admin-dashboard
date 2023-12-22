import { ApiProperty } from '@nestjs/swagger';

import { IsMongoId } from 'class-validator';

export class AssignRoleParamsDto {
  @ApiProperty({ required: true, description: 'The role id' })
  @IsMongoId()
  roleId: string;

  @ApiProperty({ required: true, description: 'The user id' })
  @IsMongoId()
  userId: string;
}
