import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { createDataSource, DatabaseRepository, Lookup } from '@containerly/db';
import { QUEUE_NAMES, LookupStatus } from '@containerly/common';
import { JsoncargoWorkerService } from './services/jsoncargoWorker.service';

export class Processor {
  private lookupWorker: Worker;
  private dbRepository?: DatabaseRepository;
  private jsoncargoService: JsoncargoWorkerService;
  private connection: IORedis;

  constructor() {
    // Create Redis connection
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    // Create worker to process jobs
    this.lookupWorker = new Worker(
      QUEUE_NAMES.LOOKUP,
      async (job: Job<{ lookupId: string; query: string }>) => {
        const { lookupId, query } = job.data;
        console.log(`Processing lookup ${lookupId} with query: ${query}`);

        try {
          // Update status to processing
          await this.updateLookupStatus(
            lookupId,
            LookupStatus.PROCESSING
          );

          // Perform lookup
          const result = await this.jsoncargoService.lookup(query);

          // Update status to completed
          await this.updateLookupStatus(
            lookupId,
            LookupStatus.COMPLETED,
            result.data
          );

          console.log(`Lookup ${lookupId} completed successfully`);
        } catch (error: any) {
          console.error(`Lookup ${lookupId} failed:`, error);
          await this.updateLookupStatus(
            lookupId,
            LookupStatus.FAILED,
            undefined,
            error.message || 'Lookup failed'
          );
          throw error; // Re-throw to mark job as failed
        }
      },
      {
        connection: this.connection,
      }
    );

    this.jsoncargoService = new JsoncargoWorkerService();

    // Set up event handlers
    this.lookupWorker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.lookupWorker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  }

  async start() {
    // Initialize database connection with retry logic
    const dataSource = createDataSource(process.env.DATABASE_URL!);
    
    // Retry initialization up to 10 times with 3 second delays
    let retries = 10;
    while (retries > 0) {
      try {
        await dataSource.initialize();
        this.dbRepository = new DatabaseRepository(dataSource);
        console.log('Worker processor started');
        return;
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to connect to database after 10 attempts: ${error.message}`);
        }
        console.log(`Database connection failed, retrying... (${10 - retries}/10)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  async stop() {
    await this.lookupWorker.close();
    await this.connection.quit();
  }

  private async updateLookupStatus(
    id: string,
    status: LookupStatus,
    result?: any,
    error?: string
  ): Promise<void> {
    if (!this.dbRepository) {
      throw new Error('Database repository not initialized. Call start() first.');
    }

    const lookup = await this.dbRepository.lookupRepository.findOne({
      where: { id },
    });

    if (!lookup) {
      throw new Error(`Lookup ${id} not found`);
    }

    lookup.status = status;
    if (result) {
      lookup.result = result;
    }
    if (error) {
      lookup.error = error;
    }
    if (status === LookupStatus.COMPLETED || status === LookupStatus.FAILED) {
      lookup.completedAt = new Date();
    }

    await this.dbRepository.lookupRepository.save(lookup);
  }
}

