import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PasswordResetInputDto {
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

export default PasswordResetInputDto;
