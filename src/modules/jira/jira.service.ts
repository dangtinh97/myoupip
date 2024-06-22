import { Injectable } from '@nestjs/common';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { EVENT, JiraLog, JiraLogDocument } from './schemas/jira_log.schema';
import {
  JiraProject,
  JiraProjectDocument,
} from './schemas/jira_project.schema';
import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

@Injectable()
export class JiraService {
  constructor(
    @NestInjectModel(JiraLog.name)
    private jiraLogModel: Model<JiraLogDocument>,
    @NestInjectModel(JiraProject.name)
    private jiraProjectModel: Model<JiraProjectDocument>,
  ) {}

  public async webhook(body: any) {
    const event = _.get(body, 'issue_event_type_name', '');
    await this.jiraLogModel.create({
      key: 'WEBHOOK',
      data: body,
      event: event,
      project_key: _.get(body, 'issue.fields.project.key', ''),
    });
    if (event === EVENT.ISSUE_CREATE) {
      return await this.createIssue(_.get(body, 'issue', {}));
    }
  }

  async createIssue(issue: any) {
    const id = _.get(issue, 'id', '');
    const projectKey = _.get(issue, 'fields.project.key', '');
    const summary = _.get(issue, 'fields.summary', '');
    const description = {};
    const issueType = _.get(issue, 'fields.issuetype.name', '');
    const projectNew =
      projectKey === process.env.KEY_PROJECT_FIRST
        ? process.env.PROJECT_SECOND
        : process.env.PROJECT_FIRST;
    const now = new Date();
    const time = now.setMinutes(now.getMinutes() - 1);
    const find = await this.jiraProjectModel.findOne({
      summary: summary,
      createdAt: {
        $gte: time,
      },
    });
    if (find) {
      await this.jiraLogModel.create({
        key: 'DUPLICATE_ISSUE',
        data: {
          summary,
        },
      });
      console.log('DUPLICATE');
      return;
    }
    const newIssue = await this.sync({
      project: projectNew,
      summary: summary,
      issue_type: issueType,
    });
    await this.jiraProjectModel.create({
      from_issue_id: id,
      summary: summary,
      description: description,
      issue_type: issueType,
      sync_project: newIssue,
      from_issue_key: _.get(issue, 'key', ''),
    });
  }

  async sync({ project, summary, issue_type }): Promise<any> {
    try {
      const curl = await fetch(`${project.split('|')[1]}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.BASIC_AUTHENTICATION}`,
        },
        body: JSON.stringify({
          fields: {
            summary: summary,
            project: {
              key: project.split('|')[0],
            },
            issuetype: {
              name: issue_type,
            },
          },
        }),
      });
      return await curl.json();
    } catch (e: any) {
      return {
        data: {
          project,
          summary,
          issue_type,
        },
        error: e.message,
      };
    }
  }
}
