import { Role } from 'src/roles/schemas/role.schema';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  roles: Role[];
  refreshTokens: string[];
}
