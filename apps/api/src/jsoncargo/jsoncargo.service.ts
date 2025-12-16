import { Injectable } from '@nestjs/common';
import { MockService } from './mock.service';

@Injectable()
export class JsoncargoService {
  constructor(private mockService: MockService) {}

  async lookup(query: string): Promise<any> {
    // In a real implementation, this would call the JSONCargo API
    // For now, we'll use the mock service
    return this.mockService.lookup(query);
  }
}




