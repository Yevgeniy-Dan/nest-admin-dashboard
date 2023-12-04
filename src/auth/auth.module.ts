import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SignUpController } from './sign-up/sign-up.controller';
import { SignUpService } from './sign-up/sign-up.service';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UpdateTokensService } from './refresh-tokens/update-tokens.service';
import { UpdateTokensController } from './refresh-tokens/update-tokens.controller';
import { AuthRefreshTokenModule } from './token/refresh-token/refresh-token.module';
import { AuthAccessTokenModule } from './token/access-token/access-token.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuthAccessTokenModule,
    AuthRefreshTokenModule,
  ],
  controllers: [SignUpController, LoginController, UpdateTokensController],
  providers: [
    SignUpService,
    AuthService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    LoginService,
    UpdateTokensService,
  ],
})
export class AuthModule {}
