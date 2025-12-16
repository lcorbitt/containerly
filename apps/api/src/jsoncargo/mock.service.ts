import { Injectable } from '@nestjs/common';

@Injectable()
export class MockService {
  async lookup(query: string): Promise<any> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Return mock data based on query
    return {
      query,
      data: {
        result: `Mock result for: ${query}`,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'mock',
          processed: true,
        },
      },
    };
  }
}




