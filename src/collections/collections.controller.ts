import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CollectionsService } from './collections.service';


@Controller('collections')
export class CollectionsController {

  constructor(
    private readonly collectionsService:
      CollectionsService,
  ) {}


  /* =======================================================
     PUBLIC SHARED COLLECTION
  ======================================================= */

  @Get('shared/:shareToken')
  getSharedCollection(
    @Param('shareToken')
    shareToken: string,
  ) {

    return this.collectionsService.findShared(
      shareToken,
    );

  }


  /* =======================================================
     AUTHENTICATED ROUTES
  ======================================================= */

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Req() req,
  ) {

    return this.collectionsService.findAll(
      req.user.userId,
    );

  }


  /* =======================================================
     ONE COLLECTION
  ======================================================= */

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.collectionsService.findOne(
      req.user.userId,
      id,
    );

  }


  /* =======================================================
     CREATE
  ======================================================= */

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Req() req,

    @Body()
    body: {
      name: string;
    },
  ) {

    return this.collectionsService.create(
      req.user.userId,
      body.name,
    );

  }


  /* =======================================================
     ADD SAVED ITEM
  ======================================================= */

  @Post(':id/items')
  @UseGuards(AuthGuard('jwt'))
  addItem(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      savedItemId: number;
    },
  ) {

    return this.collectionsService.addItem(
      req.user.userId,
      id,
      Number(body.savedItemId),
    );

  }


  /* =======================================================
     REORDER
  ======================================================= */

  @Patch(':id/reorder')
  @UseGuards(AuthGuard('jwt'))
  reorder(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      itemIds: number[];
    },
  ) {

    return this.collectionsService.reorder(
      req.user.userId,
      id,
      body.itemIds,
    );

  }


  /* =======================================================
     DELETE COLLECTION
  ======================================================= */

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Req() req,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.collectionsService.removeCollection(
      req.user.userId,
      id,
    );

  }


  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  @Delete('items/:itemId')
  @UseGuards(AuthGuard('jwt'))
  removeItem(
    @Req() req,

    @Param(
      'itemId',
      ParseIntPipe,
    )
    itemId: number,
  ) {

    return this.collectionsService.removeItem(
      req.user.userId,
      itemId,
    );

  }

}