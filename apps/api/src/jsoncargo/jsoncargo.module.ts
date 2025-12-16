import { Module } from '@nestjs/common';
import { JsoncargoService } from './jsoncargo.service';
import { MockService } from './mock.service';

@Module({
  providers: [JsoncargoService, MockService],
  exports: [JsoncargoService],
})
export class JsoncargoModule {}




