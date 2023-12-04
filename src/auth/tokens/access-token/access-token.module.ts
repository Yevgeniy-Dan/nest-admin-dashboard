import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from 'src/interfaces/configuration.interface';
import { AccessTokenService } from './access-token.service';
import { ACCESS_TOKEN_LIFESPAN } from 'src/constants';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Configuration>) => ({
        secret: configService.get<string>('JWT_ACCESS_KEY'),
        signOptions: { expiresIn: `${ACCESS_TOKEN_LIFESPAN}h` },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AccessTokenService],
  exports: [JwtModule, AccessTokenService],
})
export class AuthAccessTokenModule {}
