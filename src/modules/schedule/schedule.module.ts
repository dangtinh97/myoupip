import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LcmHealth, LcmHealthSchema } from './schemas/health.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: LcmHealth.name, schema: LcmHealthSchema },
    ]),
  ],
  controllers: [],
  providers: [ScheduleService],
})
export class CronModule {}
