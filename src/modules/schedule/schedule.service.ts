import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { LcmHealth, LcmHealthDocument } from './schemas/health.schema';
import * as process from 'process';

@Injectable()
export class ScheduleService {
  constructor(
    @NestInjectModel(LcmHealth.name)
    private healthModel: Model<LcmHealthDocument>,
  ) {}

  // @Cron('*/60 * * * * *')
  async handleCron() {
    console.log('run', new Date());
    const list: any = await this.healthModel.find({
      is_run: true,
    });
    for (let i = 0; i < list.length; i++) {
      await this.curlData(list[i]);
    }
  }

  async curlData(data: any): Promise<any> {
    try {
      const curl = await fetch(data.url, {
        method: data.type,
        body:
          data.type === 'POST' && typeof data.data != 'undefined'
            ? JSON.stringify(data.data)
            : null,
      });
      await this.healthModel
        .findOneAndUpdate(
          {
            _id: data._id,
          },
          {
            $set: {
              status: curl.status,
            },
          },
        )
        .exec();
      if (!curl.ok && curl.status != 404) {
        await this.sendNotification({
          url: data.url,
          status: curl.status,
        });
      }
      return true;
    } catch (e: any) {
      await this.sendNotification({
        url: data.url,
        message: e.message,
      });
    }
    return true;
  }

  async sendNotification(data: any) {
    await fetch(
      `https://api.telegram.org/bot${process.env.TOKEN_TELEGRAM_BOT_HEALTH}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: '-1002240241078',
          text: JSON.stringify(data, null, 4),
        }),
      },
    );
  }
}
