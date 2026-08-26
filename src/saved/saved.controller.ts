import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { SavedService } from './saved.service';


@Controller('saved')
@UseGuards(
  AuthGuard('jwt'),
)
export class SavedController {

  constructor(
    private readonly savedService:
      SavedService,
  ) {}


  /* =======================================================
     GET ALL SAVED
  ======================================================= */

  @Get()
  getSaved(
    @Req() req,
  ) {

    return this.savedService.getSaved(
      req.user.userId,
    );

  }


  /* =======================================================
     STREAKS
  ======================================================= */

  @Get('streaks')
  getStreaks(
    @Req() req,
  ) {

    return this.savedService.getStreaks(
      req.user.userId,
    );

  }


  /* =======================================================
     CHECK CONTENT
  ======================================================= */

  @Get('check/:contentId')
  isSaved(
    @Req() req,

    @Param(
      'contentId',
      ParseIntPipe,
    )
    contentId: number,
  ) {

    return this.savedService.isSaved(
      req.user.userId,
      contentId,
    );

  }


  /* =======================================================
     SAVE
  ======================================================= */

  @Post()
  save(
    @Req() req,

    @Body()
    body: {
      contentId: number;
    },
  ) {

    return this.savedService.saveContent(
      req.user.userId,
      Number(
        body.contentId,
      ),
    );

  }


  /* =======================================================
     GET ONE
  ======================================================= */

  @Get(':id')
  getOne(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.savedService.getOne(
      req.user.userId,
      id,
    );

  }


  /* =======================================================
     DELETE
  ======================================================= */

  @Delete(':id')
  remove(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.savedService.removeSaved(
      req.user.userId,
      id,
    );

  }

}