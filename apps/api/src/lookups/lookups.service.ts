import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Lookup } from '@containerly/db';
import { CreateLookupDto, LookupStatus, QUEUE_NAMES } from '@containerly/common';
import { UpdatesGateway } from '../gateways/updates.gateway';

@Injectable()
export class LookupsService {
  constructor(
    @InjectRepository(Lookup)
    private lookupRepository: Repository<Lookup>,
    @InjectQueue(QUEUE_NAMES.LOOKUP)
    private lookupQueue: Queue,
    private updatesGateway: UpdatesGateway
  ) {}

  async findAll(userId: string, orgId: string): Promise<Lookup[]> {
    return this.lookupRepository.find({
      where: { userId, orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, orgId: string): Promise<Lookup> {
    const lookup = await this.lookupRepository.findOne({ where: { id, orgId } });
    if (!lookup) {
      throw new NotFoundException('Lookup not found');
    }
    if (lookup.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return lookup;
  }

  async create(createLookupDto: CreateLookupDto, userId: string, orgId: string): Promise<Lookup> {
    const lookup = this.lookupRepository.create({
      query: createLookupDto.query,
      userId,
      orgId,
      status: LookupStatus.PENDING,
    });

    const savedLookup = await this.lookupRepository.save(lookup);

    // Add job to queue
    await this.lookupQueue.add('process', {
      lookupId: savedLookup.id,
      query: savedLookup.query,
    });

    return savedLookup;
  }

  async refresh(id: string, userId: string, orgId: string): Promise<Lookup> {
    const lookup = await this.findOne(id, userId, orgId);

    // Reset lookup status
    lookup.status = LookupStatus.PENDING;
    lookup.error = null;
    lookup.result = null;
    lookup.completedAt = null;
    await this.lookupRepository.save(lookup);

    // Add job to queue
    await this.lookupQueue.add('process', {
      lookupId: lookup.id,
      query: lookup.query,
    });

    return lookup;
  }

  async updateStatus(
    id: string,
    status: LookupStatus,
    result?: any,
    error?: string
  ): Promise<Lookup> {
    const lookup = await this.lookupRepository.findOne({ where: { id } });
    if (!lookup) {
      throw new NotFoundException('Lookup not found');
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

    const updated = await this.lookupRepository.save(lookup);

    // Emit WebSocket update - convert entity to common type
    this.updatesGateway.emitLookupUpdate({
      id: updated.id,
      userId: updated.userId,
      orgId: updated.orgId,
      query: updated.query,
      status: updated.status,
      result: updated.result ? { data: updated.result } : undefined,
      error: updated.error || undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      completedAt: updated.completedAt || undefined,
    });

    return updated;
  }
}

