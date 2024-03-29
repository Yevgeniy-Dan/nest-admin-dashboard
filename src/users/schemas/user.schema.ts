import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Factory } from 'nestjs-seeder';

import { Role } from 'src/roles/schemas/role.schema';
import { Content } from 'src/content/schemas/content.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @ApiProperty({ required: true })
  @Prop({ required: true, unique: true })
  @Factory((faker) => faker.internet.email())
  email: string;

  @Prop({ required: false })
  @Exclude({ toPlainOnly: true })
  @Factory((faker) => faker.internet.password())
  password?: string;

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
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    required: true,
  })
  roles: Role[];

  @ApiProperty({
    required: false,
    description: 'The avatar ref',
    type: String,
  })
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  })
  avatar?: Content;

  @Prop({ type: String, required: false })
  resetPasswordToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
