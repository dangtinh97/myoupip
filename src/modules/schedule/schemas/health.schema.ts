import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LcmHealthDocument = HydratedDocument<LcmHealth>;

@Schema({ timestamps: true, collection: 'lcm_health' })
export class LcmHealth {
  @Prop()
  url: string;

  @Prop()
  type: string;

  @Prop({ type: Object })
  data: any;

  @Prop()
  is_run: boolean;

  @Prop()
  status: number;
}

export const LcmHealthSchema = SchemaFactory.createForClass(LcmHealth);
