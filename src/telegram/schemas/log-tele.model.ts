import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import any = jasmine.any;
import { HydratedDocument } from "mongoose";
import { User } from "../../schemas/user.schema";
export type LogTelegramDocument = HydratedDocument<LogTelegram>;
@Schema({ timestamps: true, collection: 'tele_logs' })
export class LogTelegram {
  @Prop({ type: Object })
  data: any;
}

export const LogTelegramSchema = SchemaFactory.createForClass(LogTelegram);
