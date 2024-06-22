import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type JiraProjectDocument = HydratedDocument<JiraProject>;

@Schema({ timestamps: true, collection: 'jira_projects' })
export class JiraProject {
  @Prop()
  from_issue_id: string;

  @Prop()
  from_issue_key: string;

  @Prop()
  summary: string;

  @Prop({ type: Object })
  description: any;

  @Prop()
  issue_type: string;

  @Prop({ type: Object })
  sync_project: any;
}

export enum EVENT {
  ISSUE_CREATE = 'issue_created',
}

export const JiraProjectSchema = SchemaFactory.createForClass(JiraProject);
