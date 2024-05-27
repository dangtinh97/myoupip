import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import any = jasmine.any;
import { HydratedDocument } from 'mongoose';
import { User } from '../../schemas/user.schema';

export type TelegramConnectDocument = HydratedDocument<TelegramConnect>;

@Schema({ timestamps: true, collection: 'tele_users' })
export class TelegramConnect {
  @Prop({ type: String })
  telegram_id: string;

  @Prop()
  status: string;

  @Prop()
  connect_with_id: string;
}

export const TelegramConnectSchema =
  SchemaFactory.createForClass(TelegramConnect);
