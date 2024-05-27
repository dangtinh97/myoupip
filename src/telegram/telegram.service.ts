import { Injectable } from '@nestjs/common';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { LogTelegram, LogTelegramDocument } from './schemas/log-tele.model';
import { SuccessResponse } from "../Responses/success.response";

@Injectable()
export class TelegramService {
  constructor(
    @NestInjectModel(LogTelegram.name)
    private logModel: Model<LogTelegramDocument>,
  ) {}

  async webhook(data:any):Promise<any>{
    await this.logModel.create({
      data: data
    })
    return new SuccessResponse();
  }
}
