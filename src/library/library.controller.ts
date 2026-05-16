import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { LibraryService } from './library.service';

@Controller('library')

export class LibraryController {

  constructor(
    private libraryService: LibraryService,
  ) {}

  // =====================================
  // MY LIBRARY
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('me')

  getMyLibrary(@Req() req) {

    return this.libraryService.getUserLibrary(
      req.user.userId,
    );

  }

}