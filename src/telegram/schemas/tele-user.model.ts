import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import any = jasmine.any;
import { HydratedDocument } from 'mongoose';
import { User } from '../../schemas/user.schema';

export type TelegramUserDocument = HydratedDocument<TelegramUser>;

@Schema({ timestamps: true, collection: 'tele_users' })
export class TelegramUser {
  @Prop({ type: String })
  telegram_id: string;

  @Prop()
  first_name: string;

  @Prop()
  username: string;

  @Prop()
  status: string;

  @Prop()
  connect_with_id: string;

  @Prop()
  last_name: string;
}

export enum USER_STATUS {
  FREE = 'FREE',
  BUSY = 'BUSY',
  WAIT = 'WAIT',
}

export const TelegramUserSchema = SchemaFactory.createForClass(TelegramUser);
