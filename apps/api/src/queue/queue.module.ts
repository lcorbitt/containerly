import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '@containerly/common';
import { LookupProcessor } from './jobs/lookup.processor';
import { JsoncargoModule } from '../jsoncargo/jsoncargo.module';
import { LookupsModule } from '../lookups/lookups.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? (() => {
            const url = new URL(process.env.REDIS_URL!);
            return {
              host: url.hostname,
              port: parseInt(url.port || '6379'),
            };
          })()
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.LOOKUP,
    }),
    JsoncargoModule,
    forwardRef(() => LookupsModule),
  ],
  providers: [LookupProcessor],
  exports: [BullModule],
})
export class QueueModule {}

