import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
