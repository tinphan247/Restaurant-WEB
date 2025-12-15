import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // Không có tiền tố => endpoint là /api/
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // GET /api/
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health') // GET /api/health
  getHealth(): { status: string; uptime: number } {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }
}