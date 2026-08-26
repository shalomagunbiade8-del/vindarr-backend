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
@UseGuards(
  AuthGuard('jwt'),
)
export class CollectionsController {

  constructor(
    private readonly collectionsService:
      CollectionsService,
  ) {}


  /* =======================================================
     ALL COLLECTIONS
  ======================================================= */

  @Get()
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
      Number(
        body.savedItemId,
      ),
    );

  }


  /* =======================================================
     REORDER
  ======================================================= */

  @Patch(':id/reorder')
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