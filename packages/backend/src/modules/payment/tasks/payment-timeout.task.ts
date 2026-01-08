import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment.service';

/**
 * CRON TASK: Auto-timeout payment
 * Runs every 1 minute
 * Update payment pending ≥5 minutes to expired
 */
@Injectable()
export class PaymentTimeoutTask {
	private readonly logger = new Logger(PaymentTimeoutTask.name);

	constructor(private readonly paymentService: PaymentService) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async handlePaymentTimeout() {
		try {
			const result = await this.paymentService.handlePaymentTimeout(5);
			if (result.processedCount > 0) {
				this.logger.log(`[PaymentTimeoutTask] Processed ${result.processedCount} payments - IDs: ${result.updatedPaymentIds.join(',')}`);
			}
		} catch (error) {
			this.logger.error(
				`[PaymentTimeoutTask] Error executing payment timeout task - ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}
}
