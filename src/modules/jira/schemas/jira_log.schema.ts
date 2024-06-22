import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type JiraLogDocument = HydratedDocument<JiraLog>;

@Schema({ timestamps: true, collection: 'jira_logs' })
export class JiraLog {
  @Prop()
  key: string;

  @Prop({ type: Object })
  data: any;

  @Prop()
  event: string;

  @Prop()
  project_key: string;
}

export const JiraLogSchema = SchemaFactory.createForClass(JiraLog);
