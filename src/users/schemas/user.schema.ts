import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
