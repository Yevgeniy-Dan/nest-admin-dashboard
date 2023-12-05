export interface IUser {
  _id?: string;
  email: string;
  password: string;
  refreshTokens: string[];
}
