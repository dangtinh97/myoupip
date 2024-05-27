import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './Account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeModule } from './Youtube/youtube.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from "./telegram/telegram.module";

@Module({
  imports: [
    AccountModule,
    YoutubeModule,
    TelegramModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
