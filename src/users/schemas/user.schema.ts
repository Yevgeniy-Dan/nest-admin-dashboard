import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/roles/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.toString())
  _id?: string;

  @ApiProperty({ required: true })
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({ type: [String], default: [] })
  @Exclude({ toPlainOnly: true })
  refreshTokens: string[];

  @ApiProperty({ required: true, type: [String] })
  @Prop({ required: true, default: [Role.User] })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
