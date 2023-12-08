import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Role as RoleEnum } from '../enums/role.enum';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.toString())
  _id?: string;

  @ApiProperty({ required: true })
  @Prop({
    required: true,
    unique: true,
    type: String,
    enum: Object.values(RoleEnum),
  })
  role: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
