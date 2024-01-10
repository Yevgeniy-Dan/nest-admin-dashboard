import { UserDocument } from 'src/users/schemas/user.schema';
import { IFacebookPayload, IJwtTokenResponse } from './token.interface';

export interface IRequestWithUserPayload {
  user: IJwtTokenResponse;
}

export interface IRequestWithUser {
  user: UserDocument;
}

export interface IRequestWithFacebookUserPayload {
  user: IFacebookPayload;
}
