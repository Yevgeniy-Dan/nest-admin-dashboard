import { Role } from 'src/roles/schemas/role.schema';

export interface IJwtPayload {
  email: string;
  roles: Role[];
  sub: string;
}

export interface IJwtTokenResponse {
  userId: string;
  email: string;
  roles: Role[];
  type: 'refresh' | 'access';
}
