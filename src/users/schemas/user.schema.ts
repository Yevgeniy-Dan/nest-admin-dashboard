import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { Exclude, Transform } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @Transform(({ value }) => value.toString())
  _id?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ type: [String], default: [] })
  @Exclude()
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
