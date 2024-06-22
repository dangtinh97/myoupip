import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JiraLog, JiraLogSchema } from './schemas/jira_log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JiraLog.name, schema: JiraLogSchema }]),
  ],
  controllers: [JiraController],
  providers: [JiraService],
})
export class JiraModule {}
