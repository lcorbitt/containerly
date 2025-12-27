// Load .env file FIRST, before any other imports that might use environment variables
// Using require to ensure this executes before imports are evaluated
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.warn(`Warning: Could not load .env file from ${envPath}:`, result.error.message);
} else {
  console.log(`Loaded .env file from ${envPath}`);
}

// Debug: Log DATABASE_URL (without password)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`DATABASE_URL: ${dbUrl}`);
} else {
  console.error('ERROR: DATABASE_URL is not set!');
}

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();




