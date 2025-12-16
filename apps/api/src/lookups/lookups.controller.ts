import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LookupsService } from './lookups.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CreateLookupDto } from '@containerly/common';

@Controller('lookups')
@UseGuards(JwtAuthGuard)
export class LookupsController {
  constructor(private lookupsService: LookupsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.lookupsService.findAll(req.user.userId, req.user.orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.lookupsService.findOne(id, req.user.userId, req.user.orgId);
  }

  @Post()
  async create(@Body() createLookupDto: CreateLookupDto, @Request() req: any) {
    return this.lookupsService.create(createLookupDto, req.user.userId, req.user.orgId);
  }

  @Post(':id/refresh')
  async refresh(@Param('id') id: string, @Request() req: any) {
    return this.lookupsService.refresh(id, req.user.userId, req.user.orgId);
  }
}

