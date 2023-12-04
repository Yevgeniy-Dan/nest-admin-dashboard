import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from 'src/users/users.module';
import { AuthAccessTokenModule } from './tokens/access-token/access-token.module';
import { AuthRefreshTokenModule } from './tokens/refresh-token/refresh-token.module';

import { LoginController } from './login/login.controller';
import { SignUpController } from './sign-up/sign-up.controller';
import { UpdateTokensController } from './refresh-tokens/update-tokens.controller';

import { AuthService } from './auth.service';
import { SignUpService } from './sign-up/sign-up.service';
import { LoginService } from './login/login.service';
import { UpdateTokensService } from './refresh-tokens/update-tokens.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

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
