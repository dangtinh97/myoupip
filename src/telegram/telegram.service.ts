import { Injectable } from '@nestjs/common';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { LogTelegram, LogTelegramDocument } from './schemas/log-tele.model';
import { SuccessResponse } from '../Responses/success.response';
import {
  TelegramUser,
  TelegramUserDocument,
  USER_STATUS,
} from './schemas/tele-user.model';
import * as process from 'process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

@Injectable()
export class TelegramService {
  public static START = 'START';
  public static CONNECT = 'KETNOI';

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
    const syncUser = await this.syncUser(_.get(data, 'message.from'));
    console.log(syncUser);
    const command = this.detectCommand(data);
    if (command != null) {
      return await this.processCommand(command, syncUser);
    }
    return new SuccessResponse();
  }

  async processCommand(command: string, { id, status }: any) {
    console.log(id, status);
    if (command == TelegramService.START) {
      return this.commandStart(id);
    }
    if (command == TelegramService.CONNECT) {
      return this.commandStart(id);
    }

    if (command === TelegramService.CONNECT) {
      return this.commandConnect(id, status);
    }
  }

  async commandConnect(id: string, status: string) {
    if (status === USER_STATUS.BUSY) {
      return this.sendMessageToUser(id, 'Bạn đang kết nối với 1 người khác');
    }

    const idConnect = await this.findUserWait(id);
    if (idConnect != null) {
      await this.sendMessageToUser(
        id,
        `Bạn đã được kết nối với id ${idConnect}`,
      );
      await this.sendMessageToUser(
        idConnect,
        `Bạn đã được kết nối với id ${id}`,
      );
      return true;
    }

    if (status === USER_STATUS.WAIT) {
      return this.sendMessageToUser(
        id,
        'Vui lòng chờ đợi thêm, chúng tôi đang cố gắng kết nối bạn với người khác.',
      );
    }

    await this.userModel
      .updateOne({
        telegram_id: id,
        status: USER_STATUS.WAIT,
      })
      .exec();
    return this.sendMessageToUser(
      id,
      'Chúng tôi đang tìm kiếm người phù hợp với bạn',
    );
  }

  private async findUserWait(id: string): Promise<any> {
    const find = await this.userModel.findOne({
      telegram_id: {
        $ne: id,
      },
      status: USER_STATUS.WAIT,
    });
    if (find == null) {
      return null;
    }
    await this.userModel.updateOne({
      telegram_id: find.telegram_id,
      status: USER_STATUS.BUSY,
      connect_with_id: id,
    });

    await this.userModel.updateOne({
      telegram_id: id,
      status: USER_STATUS.BUSY,
      connect_with_id: find.telegram_id,
    });
    return id;
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
    const id = parseInt(data.id).toString();
    const findUser = await this.userModel.findOne({
      telegram_id: id,
    });

    if (findUser == null) {
      await this.userModel.create({
        telegram_id: id,
        username: _.get(data, 'username'),
        first_name: _.get(data, 'first_name'),
        status: USER_STATUS.FREE.toString(),
      });
    }
    return {
      id: id,
      status:
        findUser == null || typeof findUser.status === 'undefined'
          ? USER_STATUS.FREE.toString()
          : findUser.status,
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
