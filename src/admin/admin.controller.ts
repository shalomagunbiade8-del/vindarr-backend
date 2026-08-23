import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('test')
  test() {
    return {
      success: true,
      message: 'Admin module is working',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  getDashboardStats(@Req() req: any) {
    return this.adminService.getDashboardStats(req);
  }
}