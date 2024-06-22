import { Controller, Post, Req } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private jiraService: JiraService) {}

  @Post('/webhook')
  async webhook(@Req() req: Request): Promise<any> {
    console.log(req.json());
    await this.jiraService.webhook(req.json());
    return 'OK';
  }
}
