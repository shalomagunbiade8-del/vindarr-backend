import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getRoot() {
    return {
      message: 'Oraizon API is running 🚀',
      status: 'ok'
    };
  }

  @Get('health')
  healthCheck() {
    return {
      service: 'Oraizon Backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
} 