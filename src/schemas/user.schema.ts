import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'app_users' })
export class User {
  @Prop()
  username: string;

  @Prop()
  full_name: string;

  @Prop()
  short_name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
