import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The user email',
  })
  @IsString()
  @IsEmail()
  readonly email: string;
}

export default UpdateUserDto;
