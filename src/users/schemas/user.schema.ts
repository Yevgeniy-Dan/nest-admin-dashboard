import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Factory } from 'nestjs-seeder';

import { IUser } from '../interfaces/user.interface';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.toString())
  _id?: string;

  @ApiProperty({ required: true })
  @Prop({ required: true, unique: true })
  @Factory((faker) => faker.internet.email())
  email: string;

  @Prop({ required: true })
  @Exclude({ toPlainOnly: true })
  @Factory((faker) => faker.internet.password())
  password: string;

  @Prop({ type: [String], default: [] })
  @Exclude({ toPlainOnly: true })
  @Factory(() => [])
  refreshTokens: string[];

  @ApiProperty({
    required: true,
    type: [String],
    items: { type: 'string' },
    enum: Object.values(Role),
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Role' }],
    required: true,
  })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
