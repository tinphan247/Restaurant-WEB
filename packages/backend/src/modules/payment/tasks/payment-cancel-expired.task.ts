import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment.service';

/**
 * CRON TASK: Cancel orders whose payments have been expired for at least N minutes
 * Default delay: 2 minutes after payment expired
 * Runs every minute
 */
@Injectable()
export class PaymentCancelExpiredTask {
  private readonly logger = new Logger(PaymentCancelExpiredTask.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCancelExpiredOrders() {
    try {
      const result = await this.paymentService.cancelOrdersWithExpiredPayments(2);
      if (result.processedCount > 0) {
        this.logger.log(
          `[PaymentCancelExpiredTask] Cancelled ${result.processedCount} orders - IDs: ${result.cancelledOrderIds.join(',')}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[PaymentCancelExpiredTask] Error executing cancel expired orders task - ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
