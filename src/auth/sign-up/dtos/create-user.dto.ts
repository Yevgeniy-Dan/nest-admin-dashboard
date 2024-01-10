import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Length,
} from 'class-validator';

export class CreateUserWithPasswordDto {
  @ApiProperty({
    description: 'The user email',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'The user password',
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, one digit',
  })
  readonly password: string;
}

export class CreateUserWithoutPasswordDto {
  @ApiProperty({
    description: 'The user email',
  })
  @IsEmail()
  readonly email: string;
}
