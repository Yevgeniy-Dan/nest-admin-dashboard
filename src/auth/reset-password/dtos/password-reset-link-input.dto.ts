import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class PasswordResetLinkInputDto {
  @ApiProperty({ description: 'The user email' })
  @IsString()
  @IsEmail()
  readonly email: string;
}

export default PasswordResetLinkInputDto;
