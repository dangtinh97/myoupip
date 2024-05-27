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
}

export const TelegramUserSchema = SchemaFactory.createForClass(TelegramUser);
