import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './Account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'process';
import { YoutubeModule } from './Youtube/youtube.module';

@Module({
  imports: [
    AccountModule,
    YoutubeModule,
    // MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost/nest'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
