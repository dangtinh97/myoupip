import { Injectable } from '@nestjs/common';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { LogTelegram, LogTelegramDocument } from './schemas/log-tele.model';
import { SuccessResponse } from '../Responses/success.response';
import { TelegramUser, TelegramUserDocument } from './schemas/tele-user.model';
import * as process from 'process';

const _ = require('lodash');

@Injectable()
export class TelegramService {
  public static START = 'START';

  constructor(
    @NestInjectModel(LogTelegram.name)
    private logModel: Model<LogTelegramDocument>,
    @NestInjectModel(TelegramUser.name)
    private userModel: Model<TelegramUserDocument>,
  ) {}

  async webhook(data: any): Promise<any> {
    await this.logModel.create({
      data: data,
    });
    let syncUser = await this.syncUser(_.get(data, 'message.from'));
    let command = this.detectCommand(data);
    if (command != null) {
      return await this.processCommand(command, syncUser.id);
    }
    return new SuccessResponse();
  }

  async processCommand(command: string, id: string) {
    if (command == TelegramService.START) {
      return this.commandStart(id);
    }
  }

  async commandStart(id: string): Promise<any> {
    //https://api.telegram.org/bot6977170023:AAE7cOcxva6vrlYwWz1PL28aBAXW2zp4mYs/sendMessage?chat_id=1785164564&text=Send From bot :D
    await this.sendMessageToUser(
      id,
      'Chào mừng bạn đến với chatbot dành cho sinh viên\n' +
        'Một số menu của bot\n' +
        '/ketnoi : Tạo kết nối với người lạ.\n' +
        '/ketthuc : Kết thúc cuộc trò chuyện hiện tại của bạn.',
    );
  }

  async sendMessageToUser(id: string, msg: string) {
    await fetch(
      `https://api.telegram.org/bot${process.env.TOKEN_TELEGRAM_BOT}/sendMessage`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          chat_id: id,
          text: msg,
        }),
      },
    );
  }

  private async syncUser(data: any): Promise<any> {
    console.log(data);
    const id = parseInt(data.id).toString();
    let findUser = await this.userModel.findOne({
      telegram_id: id,
    });
    console.log(findUser);
    if (findUser == null) {
      await this.userModel.create({
        telegram_id: id,
        username: _.get(data, 'username'),
        first_name: _.get(data, 'first_name'),
      });
    }
    return {
      id: id,
    };
  }

  private detectCommand(data: any): string {
    let command = _.get(data, 'message.entities.0.type');
    if (typeof command == 'undefined' || command !== 'bot_command') {
      return null;
    }
    return _.get(data, 'message.text').replace('/', '').toUpperCase();
  }
}
