import { Injectable } from '@nestjs/common';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Role as RoleEnum } from './enums/role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  /**
   * Finds a role by the role name in the database.
   * @param role - The role to search for.
   * @returns A Promise resolving to the found user with the specified role, or an Error (NotFoundException) if not found.
   */
  async findOne(role: RoleEnum): Promise<RoleDocument> {
    const roleItem = await this.roleModel.findOne({
      role: role,
    });

    return roleItem;
  }

  /**
   * Retrieves a  list of roles.
   * @returns A Promise resolving to an array of Role objects representing all roles in the database.
   */
  async findAll(): Promise<RoleDocument[]> {
    return await this.roleModel.find();
  }

  async findByIds(ids: Role[]): Promise<string[]> {
    const roles = await this.roleModel.find({ _id: { $in: ids } });
    return roles.map((role) => role.role);
  }
}
