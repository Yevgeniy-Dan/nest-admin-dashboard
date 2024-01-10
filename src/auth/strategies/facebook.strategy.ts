import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { IConfiguration } from 'src/interfaces/configuration.interface';
import { IFacebookPayload } from 'src/interfaces/token.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService<IConfiguration>) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: `${configService.get<string>(
        'API_URL',
      )}/auth/sign-in/facebook/redirect`,
      scope: ['email', 'user_photos'],
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const payload: IFacebookPayload = {
      userId: profile.id,
      profile: profile,
      accessToken,
    };

    done(null, payload);
  }
}
