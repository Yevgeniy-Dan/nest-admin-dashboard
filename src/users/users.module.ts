import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SignUpService } from 'src/auth/sign-up/sign-up.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    RolesModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, SignUpService],
  exports: [UsersService, RolesModule, MongooseModule],
  controllers: [UsersController],
})
export class UsersModule {}
