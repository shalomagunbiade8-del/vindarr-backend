import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { NotificationsService }
from './notifications.service';

@Controller('notifications')

export class NotificationsController {

  constructor(

    private notificationsService:
      NotificationsService,

  ) {}

  // =====================================
  // MY NOTIFICATIONS
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
getMyNotifications(
  @Req() req,
  @Query('page') page = 1,
) {

  return this.notificationsService
    .getUserNotifications(
      req.user.userId,
      Number(page),
    );

}

  // =====================================
  // UNREAD COUNT
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('unread')

  getUnreadCount(
    @Req() req,
  ) {

    return this.notificationsService
      .getUnreadCount(
        req.user.userId,
      );

  }

  // =====================================
  // MARK ONE READ
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')

  markRead(
    @Param('id') id: string,
    @Req() req,
  ) {

    return this.notificationsService
      .markAsRead(

        Number(id),

        req.user.userId,

      );

  }

  // =====================================
  // MARK ALL READ
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Patch('read/all')

  markAllRead(
    @Req() req,
  ) {

    return this.notificationsService
      .markAllAsRead(
        req.user.userId,
      );

  }

}