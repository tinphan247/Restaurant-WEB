// packages/backend/src/modules/report/report.controller.ts

import { Controller, Get, Query, BadRequestException, Logger } from '@nestjs/common';
import { ReportService } from './report.service';
import { RevenueQueryDto, BestSellersQueryDto } from './dto/revenue-query.dto';

@Controller('reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private readonly reportService: ReportService) {}

  /**
   * GET /reports/revenue?from=2026-01-01&to=2026-01-09&period=daily
   * Lấy báo cáo doanh thu theo khoảng thời gian
   * period: daily (mặc định), weekly, monthly
   */
  @Get('revenue')
  async getRevenueReport(@Query() query: RevenueQueryDto) {
    this.logger.log(`[GET_REVENUE] from=${query.from}, to=${query.to}, period=${query.period}`);

    if (!query.from || !query.to) {
      throw new BadRequestException('Yêu cầu from và to (YYYY-MM-DD)');
    }

    try {
      const data = await this.reportService.getRevenueReport(query);
      return {
        success: true,
        data,
        period: query.period || 'daily',
        from: query.from,
        to: query.to,
      };
    } catch (error) {
      this.logger.error(`[GET_REVENUE_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * GET /reports/best-sellers?limit=10
   * Lấy báo cáo bán chạy nhất (top N items)
   * Optional: from & to để filter theo thời gian
   */
  @Get('best-sellers')
  async getBestSellersReport(@Query() query: BestSellersQueryDto) {
    this.logger.log(`[GET_BEST_SELLERS] limit=${query.limit}`);

    try {
      const limit = Math.min(query.limit || 10, 100); // Max 100
      const data = await this.reportService.getBestSellersReport({ ...query, limit });
      return {
        success: true,
        data,
        limit,
      };
    } catch (error) {
      this.logger.error(`[GET_BEST_SELLERS_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
