import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import { Role } from '../schemas/role.schema';

enum RoleEnum {
  User = 'user',
  Admin = 'admin',
}

const seedRoles = Object.values(RoleEnum).map((name) => ({
  role: name,
}));

@Injectable()
export class RolesSeeder implements Seeder {
  constructor(@InjectModel(Role.name) private readonly role: Model<Role>) {}

  async seed(): Promise<any> {
    // Insert into the database.
    return this.role.insertMany(seedRoles);
  }

  async drop(): Promise<any> {
    return this.role.deleteMany({});
  }
}
