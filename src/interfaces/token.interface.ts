export interface IJwtPayload {
  email: string;
  sub: string;
}

export interface IJwtTokenResponse {
  userId: string;
  email: string;
  type: 'refresh' | 'access';
}
