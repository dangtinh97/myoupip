import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JiraLog, JiraLogSchema } from './schemas/jira_log.schema';
import { JiraProject, JiraProjectSchema } from './schemas/jira_project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JiraLog.name, schema: JiraLogSchema }]),
    MongooseModule.forFeature([
      { name: JiraProject.name, schema: JiraProjectSchema },
    ]),
  ],
  controllers: [JiraController],
  providers: [JiraService],
})
export class JiraModule {}
