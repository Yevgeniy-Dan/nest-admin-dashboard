import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Seeder, DataFactory } from 'nestjs-seeder';

import * as bcrypt from 'bcrypt';
import { Role as RoleEnum } from 'src/roles/enums/role.enum';

import { Role } from 'src/roles/schemas/role.schema';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    @InjectModel(Role.name) private readonly role: Model<Role>,
  ) {}

  async seed(): Promise<any> {
    const roles = await this.role.find().exec();

    // Generate 10 users.
    const users = DataFactory.createForClass(User).generate(10);

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        user.password = await bcrypt.hash(user.password as string, 10);

        const currentUserRoles =
          Math.random() < 0.5
            ? roles.filter((role) => role.role === RoleEnum.User)
            : roles.map((role) => role._id);

        user.roles = currentUserRoles;
        return user;
      }),
    );
    // Insert into the database.
    return this.user.insertMany(usersWithHashedPasswords);
  }

  async drop(): Promise<any> {
    return this.user.deleteMany({});
  }
}
