// packages/backend/src/modules/report/report.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RevenueQueryDto, BestSellersQueryDto } from './dto/revenue-query.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Lấy báo cáo doanh thu theo khoảng thời gian
   * Hỗ trợ: daily (mặc định), weekly, monthly
   */
  async getRevenueReport(query: RevenueQueryDto) {
    this.logger.log(`[REVENUE_REPORT] from=${query.from}, to=${query.to}, period=${query.period || 'daily'}`);

    if (!query.from || !query.to) {
      throw new BadRequestException('from và to là bắt buộc');
    }

    const period = query.period || 'daily';
    let dateFormat: string;

    switch (period) {
      case 'weekly':
        // Format: 2025-12-tuần 2 (week 2 of that month)
        // Calculate week number within the month
        dateFormat = `to_char(report_date, 'YYYY') || '-' || to_char(report_date, 'MM') || '-tuần ' || 
          CAST(CEILING(EXTRACT(DAY FROM report_date)::numeric / 7) AS INT)`;
        break;
      case 'monthly':
        dateFormat = "to_char(report_date, 'YYYY-MM')";
        break;
      case 'daily':
      default:
        // Normalize to string to avoid timezone shifting on the client
        dateFormat = "to_char(report_date, 'YYYY-MM-DD')";
    }

    try {
      const result = await this.dataSource.query(`
        SELECT 
          ${dateFormat} as period,
          SUM(total_revenue) as revenue,
          SUM(total_orders) as total_orders,
          SUM(completed_orders) as completed_orders
        FROM v_revenue_daily
        WHERE report_date BETWEEN $1::date AND $2::date
        GROUP BY ${dateFormat}
        ORDER BY period ASC
      `, [query.from, query.to]);

      this.logger.log(`[REVENUE_REPORT_SUCCESS] Found ${result.length} records`);
      return result;
    } catch (error) {
      this.logger.error(`[REVENUE_REPORT_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Lấy báo cáo bán chạy nhất
   * Mặc định: top 10 items theo doanh thu
   */
  async getBestSellersReport(query: BestSellersQueryDto) {
    this.logger.log(`[BEST_SELLERS_REPORT] limit=${query.limit || 10}`);

    const limit = query.limit || 10;

    try {
      let sql = `
        SELECT 
          id,
          item_name,
          total_times_ordered,
          total_quantity_sold,
          total_revenue,
          avg_order_value
        FROM v_best_sellers
      `;

      const params: any[] = [];

      // Filter by date range (optional)
      if (query.from && query.to) {
        // Nếu có filter thời gian, cần join với order_items table
        sql = `
          SELECT 
            mi.id,
            mi.name as item_name,
            COUNT(DISTINCT oi.id) as total_times_ordered,
            SUM(oi.quantity) as total_quantity_sold,
            SUM(oi.quantity * oi.price) as total_revenue,
            ROUND(AVG(oi.quantity * oi.price), 2) as avg_order_value
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status IN ('completed', 'cancelled')
            AND DATE(o.created_at) BETWEEN $1::date AND $2::date
          GROUP BY mi.id, mi.name
          ORDER BY total_revenue DESC
          LIMIT $3
        `;
        params.push(query.from, query.to, limit);
      } else {
        sql += ` LIMIT $1`;
        params.push(limit);
      }

      const result = await this.dataSource.query(sql, params);
      this.logger.log(`[BEST_SELLERS_REPORT_SUCCESS] Found ${result.length} items`);
      return result;
    } catch (error) {
      this.logger.error(`[BEST_SELLERS_REPORT_ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
