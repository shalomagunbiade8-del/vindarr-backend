import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
ForbiddenException,
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

  @Get('ebook/:id')
@UseGuards(AuthGuard('jwt'))
async getOwnedBook(
  @Param('id') id: number,
  @Req() req,
) {

  return this.libraryService.getOwnedBook(
    req.user.userId,
    Number(id),
  );

}

}