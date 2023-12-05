import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from 'src/users/users.module';
import { AuthAccessTokenModule } from './jwt-tokens/access-token/access-token.module';
import { AuthRefreshTokenModule } from './jwt-tokens/refresh-token/refresh-token.module';

import { SignInController } from './sign-in/sign-in.controller';
import { SignUpController } from './sign-up/sign-up.controller';
import { UpdateTokensController } from './update-tokens/update-tokens.controller';

import { AuthService } from './auth.service';
import { SignUpService } from './sign-up/sign-up.service';
import { SignInService } from './sign-in/sign-in.service';
import { UpdateTokensService } from './update-tokens/update-tokens.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { SignOutService } from './sign-out/sign-out.service';
import { SignOutController } from './sign-out/sign-out.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuthAccessTokenModule,
    AuthRefreshTokenModule,
  ],
  controllers: [
    SignUpController,
    SignInController,
    SignOutController,
    UpdateTokensController,
  ],
  providers: [
    SignUpService,
    SignInService,
    SignOutService,
    AuthService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    UpdateTokensService,
  ],
})
export class AuthModule {}
