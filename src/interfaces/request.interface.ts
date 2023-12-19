import { UserDocument } from 'src/users/schemas/user.schema';
import { IJwtTokenResponse } from './token.interface';

export interface IRequestWithUserPayload {
  user: IJwtTokenResponse;
}

export interface IRequestWithUser {
  user: UserDocument;
}
