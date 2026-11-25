import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurviewService } from './purview.service';

@Controller('purview')
@UseGuards(AuthGuard('jwt'))
export class PurviewController {
  constructor(
    private readonly purviewService: PurviewService,
  ) {}

  @Post(':creatorId')
  addCreator(
    @Param('creatorId', ParseIntPipe) creatorId: number,
    @Req() req,
  ) {
    return this.purviewService.addCreator(
      req.user.userId,
      creatorId,
    );
  }

  @Get('my-creators')
  getCreators(@Req() req) {
    return this.purviewService.getCreators(req.user.userId);
  }

  @Get('feed')
  getFeed(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.purviewService.getFeed(
      req.user.userId,
      page,
      limit,
    );
  }
}