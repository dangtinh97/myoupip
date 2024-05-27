import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { AccountController } from '../Account/account.controller';
import { AccountService } from '../Account/account.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { LogTelegram, LogTelegramSchema } from './schemas/log-tele.model';
import { TelegramUser, TelegramUserSchema } from "./schemas/tele-user.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LogTelegram.name, schema: LogTelegramSchema },
      { name: TelegramUser.name, schema: TelegramUserSchema },
    ]),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
