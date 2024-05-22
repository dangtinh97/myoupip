import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './Account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
