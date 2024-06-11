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
  public static DISCONNECT = 'KETTHUC';
  public static BANNED = 'BANNED';
  public static ADMIN = 'ADMIN';
  public static ADMINS = ['1780297956', '1785164564'];

  constructor(
    @NestInjectModel(LogTelegram.name)
    private logModel: Model<LogTelegramDocument>,
    @NestInjectModel(TelegramUser.name)
    private userModel: Model<TelegramUserDocument>,
  ) {}

  async webhook(data: any): Promise<any> {
    try {
      const syncUser = await this.syncUser(_.get(data, 'message.from'));
      if (syncUser.status === USER_STATUS.BANNED) {
        return this.sendMessageToUser(
          syncUser.telegram_id,
          'Bạn đã bị chặn bởi hệ thống.',
        );
      }
      const command = this.detectCommand(data);
      await this.logModel.create({
        data: {
          ...syncUser,
          type: 'WEBHOOK',
          ...data,
          command: command,
        },
      });
      if (command != null) {
        return await this.processCommand(command, syncUser);
      }

      const text: any = _.get(data, 'message.text');
      if (
        typeof text != 'undefined' &&
        typeof syncUser.connect_with_id !== 'undefined'
      ) {
        await this.sendMessageToUser(syncUser.connect_with_id, text);
      }
      return new SuccessResponse();
    } catch (e: any) {
      console.error(e);
      await this.sendMessageToUser('1785164564', e?.message);
    }
    return 'OK';
  }

  async processCommand(command: string, { id, status, connect_with_id }: any) {
    console.log(id, status);
    if (command == TelegramService.START) {
      return await this.commandStart(id);
    }

    if (command === TelegramService.CONNECT) {
      return await this.commandConnect(id, status);
    }
    if (command === TelegramService.DISCONNECT) {
      return await this.commandDisconnect(id, status, connect_with_id);
    }

    if (command.indexOf(TelegramService.BANNED) !== -1) {
      return await this.commandBanned(command, id);
    }

    if (command === TelegramService.ADMIN) {
      return await this.commandAdmin(id);
    }
  }

  async commandDisconnect(
    id: string,
    status: string,
    connect_with_id: any,
  ): Promise<any> {
    await this.userModel.updateOne(
      {
        telegram_id: id,
      },
      {
        status: USER_STATUS.FREE,
        connect_with_id: null,
      },
    );

    if (connect_with_id) {
      await this.userModel.updateOne(
        {
          telegram_id: connect_with_id,
        },
        {
          status: USER_STATUS.FREE,
          connect_with_id: null,
        },
      );
      await this.sendMessageToUser(
        connect_with_id,
        `Đã ngắt kết nối với ${this.replaceId(id)}`,
      );
    }

    await this.sendMessageToUser(id, 'Đã ngắt kết nối.');
    return true;
  }

  async commandAdmin(id: any) {
    await this.sendMessageToUser(id, {
      text: 'Hiện giờ bạn có thể gửi confession tại đây hoặc gửi tin nhắn trực tiếp tới admin.',
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Gửi confession',
              url: 'https://docs.google.com/forms/d/e/1FAIpQLSfvuNQ7R-Rq5n3zsGm3xyEzhnL0SZTO_BAuQruBmkiiwSFpHw/viewform',
            },
            {
              text: 'Chat with admin',
              url: 'https://t.me/dangtinh_97',
            },
          ],
        ],
      },
    });
  }

  async commandConnect(id: string, status: string) {
    if (status === USER_STATUS.BUSY) {
      return this.sendMessageToUser(id, 'Bạn đang kết nối với 1 người khác');
    }

    const idConnect = await this.findUserWait(id);
    if (idConnect != null) {
      await this.sendMessageToUser(
        id,
        `Bạn đã được kết nối với id ${this.replaceId(idConnect)}`,
      );
      await this.sendMessageToUser(
        idConnect,
        `Bạn đã được kết nối với id ${this.replaceId(id)}`,
      );
      return true;
    }

    await this.userModel
      .updateOne(
        {
          telegram_id: id,
        },
        {
          status: USER_STATUS.WAIT,
        },
      )
      .exec();
    return this.sendMessageToUser(
      id,
      'Chúng tôi đang tìm kiếm người phù hợp với bạn',
    );
  }

  private async findUserWait(id: string): Promise<any> {
    const search: any[] = await this.userModel.aggregate([
      {
        $match: {
          telegram_id: {
            $ne: id,
          },
          status: USER_STATUS.WAIT,
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (search.length == 0) {
      return null;
    }
    const find = search[0];
    await this.userModel.updateOne(
      {
        telegram_id: find.telegram_id,
      },
      {
        status: USER_STATUS.BUSY,
        connect_with_id: id,
      },
    );

    await this.userModel.updateOne(
      {
        telegram_id: id,
      },
      {
        status: USER_STATUS.BUSY,
        connect_with_id: find.telegram_id,
      },
    );
    return find.telegram_id;
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

  async sendMessageToUser(id: string, msg: any) {
    let body: any = {
      chat_id: id,
    };

    if (typeof msg === 'string') {
      body = {
        chat_id: id,
        text: msg,
      };
    }
    if (typeof msg === 'object') {
      body = {
        ...JSON.parse(JSON.stringify(msg)),
        chat_id: id,
      };
    }
    
    console.log(body)

    const curl = await fetch(
      `https://api.telegram.org/bot${process.env.TOKEN_TELEGRAM_BOT}/sendMessage`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
    const json = await curl.json();
    console.log(json, body);
    await this.logModel.create({
      data: {
        type: 'SEND_MSG',
        telegram_id: id,
        msg: msg,
        json,
        status: curl.status,
      },
    });
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
        last_name: _.get(data, 'last_name', ''),
        status: USER_STATUS.FREE.toString(),
      });
    }
    return {
      id: id,
      telegram_id: id,
      status:
        findUser == null || typeof findUser.status === 'undefined'
          ? USER_STATUS.FREE.toString()
          : findUser.status,
      connect_with_id:
        findUser == null || typeof findUser.status === 'undefined'
          ? null
          : findUser.connect_with_id,
    };
  }

  private detectCommand(data: any): string {
    const command = _.get(data, 'message.entities.0.type');
    if (typeof command == 'undefined' || command !== 'bot_command') {
      return null;
    }
    return _.get(data, 'message.text').replace('/', '').toUpperCase();
  }

  private replaceId(chuoi: string) {
    const middleIndex = Math.floor(chuoi.length / 2);

    // Xác định phần đầu và phần cuối sau khi thay thế phần giữa bằng "xxx"
    const phanDau = chuoi.substring(0, middleIndex - 1);
    const phanCuoi = chuoi.substring(middleIndex + 2);

    // Chèn "xxx" vào giữa thay thế cho phần đã bị cắt bỏ
    return phanDau + 'xxx' + phanCuoi;
  }

  private async commandBanned(cmd: string, id: string): Promise<any> {
    if (TelegramService.ADMINS.indexOf(id) === -1) {
      return this.sendMessageToUser(
        id,
        'Lêu Lêu bạn không có quyền thực hiện lệnh này',
      );
    }
    const text = cmd.replace('BANNED', '').trim();
    const splits: any = text.split('XXX');
    const users: any = await this.userModel.find();
    let idBanned = '';
    let count = 0;
    users.forEach((user: any) => {
      if (
        user.telegram_id.startsWith(splits[0]) &&
        user.telegram_id.endsWith(splits[1])
      ) {
        count++;
        idBanned = user.telegram_id;
      }
    });

    if (count !== 1) {
      return await this.sendMessageToUser(
        id,
        'Số lượng id tìm thấy là ' + count,
      );
    }

    if (TelegramService.ADMINS.indexOf(idBanned) !== -1) {
      return await this.sendMessageToUser(id, `Không thể chặn id: ${idBanned}`);
    }
    await this.sendMessageToUser(id, `Bạn đã bị chặn bởi hệ thống.`);
    await this.userModel.findOneAndUpdate(
      {
        telegram_id: idBanned,
      },
      {
        $set: {
          status: USER_STATUS.BANNED,
        },
      },
    );

    return this.sendMessageToUser(id, `Đã chặn id: ${idBanned}`);
  }
}
