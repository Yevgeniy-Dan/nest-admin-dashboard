import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role {
  @ApiProperty({ required: true })
  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  role: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
