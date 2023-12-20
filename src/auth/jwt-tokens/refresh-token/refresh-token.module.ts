import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { IConfiguration } from 'src/interfaces/configuration.interface';
import { RefreshTokenService } from './refresh-token.service';

import { REFRESH_TOKEN_LIFESPAN } from 'src/constants';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<IConfiguration>) => ({
        secret: configService.get<string>('JWT_REFRESH_KEY'),
        signOptions: { expiresIn: `${REFRESH_TOKEN_LIFESPAN}d` },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RefreshTokenService],
  exports: [JwtModule, RefreshTokenService],
})
export class AuthRefreshTokenModule {}
