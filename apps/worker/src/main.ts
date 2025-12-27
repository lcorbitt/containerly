// Load .env file FIRST, before any other imports that might use environment variables
// Using require to ensure this executes before imports are evaluated
const path = require('path');
const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.warn(`Warning: Could not load .env file from ${path.resolve(__dirname, '../.env')}:`, result.error.message);
} else {
  console.log(`Loaded .env file from ${path.resolve(__dirname, '../.env')}`);
}

// Debug: Log DATABASE_URL (without password)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`DATABASE_URL: ${dbUrl}`);
} else {
  console.error('ERROR: DATABASE_URL is not set!');
}

import { Processor } from './processor';

async function bootstrap() {
  const processor = new Processor();
  await processor.start();
  console.log('Worker started and processing jobs...');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await processor.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await processor.stop();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});

