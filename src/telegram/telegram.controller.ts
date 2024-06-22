import { Controller, Post, Req } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('/webhook')
  async webhook(@Req() request: Request): Promise<any> {
    console.log(request);
    await this.telegramService.webhook(request);
    return 'Ok';
  }
}
