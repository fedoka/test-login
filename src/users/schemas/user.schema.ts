import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ default: 0 })
  loginAttempts: number;
  @Prop({ default: null })
  lockedUntil: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
