
import {
  Controller,
  Get,
  Query,
  Req,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request } from 'express';

import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(
    private readonly discoverService: DiscoverService,
  ) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('category') category: string,
    @Query('location') location: string,
    @Req() req: Request,
  ) {
    const query = String(q || '').trim();

    if (query.length < 2) {
      throw new BadRequestException(
        'Enter at least 2 characters to search.',
      );
    }

    if (query.length > 150) {
      throw new BadRequestException(
        'Search query is too long.',
      );
    }

    const ip =
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    const allowed =
      this.discoverService.checkRateLimit(ip);

    if (!allowed) {
      throw new HttpException(
        'Too many searches. Please wait a moment and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.discoverService.search({
      query,
      category: category || 'all',
      location: String(location || '').trim(),
    });
  }
}
