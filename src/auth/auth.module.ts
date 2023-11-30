import { Module } from '@nestjs/common';
import { SignUpController } from './sign-up/sign-up.controller';
import { SignUpService } from './sign-up/sign-up.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [SignUpController],
  providers: [SignUpService],
})
export class AuthModule {}
