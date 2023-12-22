import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The role name',
  })
  @IsString()
  @IsNotEmpty()
  readonly role: string;
}
