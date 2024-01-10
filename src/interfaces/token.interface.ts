import { Profile } from 'passport-facebook';
import { Role } from 'src/roles/schemas/role.schema';

export interface IJwtPayload {
  email: string;
  roles: Role[];
  sub: string;
}

export interface IFacebookPayload {
  userId: string;
  profile: Profile;
  accessToken: string;
}

export interface IJwtTokenResponse {
  userId: string;
  email: string;
  roles: Role[];
  type: 'refresh' | 'access';
}
