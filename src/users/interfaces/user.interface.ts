import { Role } from 'src/roles/enums/role.enum';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  roles: Role[];
  refreshTokens: string[];
}
