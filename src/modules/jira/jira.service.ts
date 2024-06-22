import { Injectable } from '@nestjs/common';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { JiraLog, JiraLogDocument } from './schemas/jira_log.schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

@Injectable()
export class JiraService {
  constructor(
    @NestInjectModel(JiraLog.name)
    private jiraLogModel: Model<JiraLogDocument>,
  ) {}

  public async webhook(body: any) {
    await this.jiraLogModel.create({
      key: 'WEBHOOK',
      data: body,
      event: _.get(body, 'issue_event_type_name', ''),
      project_key: _.get(body, 'issue.fields.project.key', ''),
    });
  }
}
