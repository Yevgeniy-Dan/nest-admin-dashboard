import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './users/schemas/user.schema';
import { Role, RoleSchema } from './roles/schemas/role.schema';

import { UsersSeeder } from './users/seeders/users.seeder';
import { RolesSeeder } from './roles/seeders/roles.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from './interfaces/configuration.interface';

import 'dotenv/config'; // need to use process.env

seeder({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
}).run([RolesSeeder, UsersSeeder]);
