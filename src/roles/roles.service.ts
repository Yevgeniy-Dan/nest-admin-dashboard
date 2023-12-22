import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Finds a role by the role name in the database.
   * @param role - The role to search for.
   * @returns A Promise resolving to the found user with the specified role, or an Error (NotFoundException) if not found.
   */
  async findOne(role: string): Promise<RoleDocument> {
    const roleItem = await this.roleModel.findOne({
      role: role,
    });

    if (!roleItem) {
      throw new NotFoundException(`${role} role  not found`);
    }

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

  /**
   * Creates a new role in the system.
   * @param {CreateRoleDto} role - The role data to be created.
   * @returns {Promise<Role>} - The newly created role.
   */
  async create(role: CreateRoleDto): Promise<Role> {
    const newRole = new this.roleModel({
      role: role.role,
    });

    return await newRole.save();
  }

  /**
   * Updates an existing role in the system.
   * @param {string} roleId - The unique identifier of the role to be updated.
   * @param {UpdateRoleDto} roleData - The updated role data.
   * @returns {Promise<Role>} - The updated role.
   */
  async update(roleId: string, roleData: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(roleId, roleData)
      .setOptions({ new: true });

    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }

  /**
   * Deletes a role from the system.
   * @param {string} roleId - The unique identifier of the role to be deleted.
   * @throws {NotFoundException} - Throws NotFoundException if the role is not found.
   */
  async delete(roleId: string): Promise<void> {
    const deletedRole = await this.roleModel.findByIdAndDelete(roleId);

    if (!deletedRole) {
      throw new NotFoundException('The role was not found.');
    }
  }

  /**
   * Assigns a role to a user in the system.
   * @param {string} roleId - The unique identifier of the role to be assigned.
   * @param {string} userId - The unique identifier of the user to whom the role will be assigned.
   * @returns {Promise<User>} - The updated user with the assigned role.
   * @throws {NotFoundException} - Throws NotFoundException if the user or role is not found.
   */
  async assignRole(roleId: string, userId: string): Promise<User> {
    const user = (await this.userModel.findById(userId)) as UserDocument;

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    if (
      user.roles.some(
        (userRole: RoleDocument) => userRole._id.toString() === roleId,
      )
    ) {
      throw new BadRequestException(`User aldready have the ${role.role} role`);
    }

    user.roles = user.roles.concat(role);

    const updatedUser = await user.save();

    return updatedUser.populate('roles', 'role -_id');
  }
}
