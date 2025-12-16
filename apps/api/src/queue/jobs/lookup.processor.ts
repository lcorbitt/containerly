import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES, LookupStatus } from '@containerly/common';
import { LookupsService } from '../../lookups/lookups.service';
import { JsoncargoService } from '../../jsoncargo/jsoncargo.service';

@Processor(QUEUE_NAMES.LOOKUP)
export class LookupProcessor extends WorkerHost {
  constructor(
    private lookupsService: LookupsService,
    private jsoncargoService: JsoncargoService
  ) {
    super();
  }

  async process(job: Job<{ lookupId: string; query: string }>) {
    const { lookupId, query } = job.data;

    try {
      // Update status to processing
      await this.lookupsService.updateStatus(lookupId, LookupStatus.PROCESSING);

      // Perform lookup
      const result = await this.jsoncargoService.lookup(query);

      // Update status to completed
      await this.lookupsService.updateStatus(
        lookupId,
        LookupStatus.COMPLETED,
        result.data
      );
    } catch (error: any) {
      // Update status to failed
      await this.lookupsService.updateStatus(
        lookupId,
        LookupStatus.FAILED,
        undefined,
        error.message || 'Lookup failed'
      );
      // Re-throw to mark job as failed in BullMQ
      throw error;
    }
  }
}

