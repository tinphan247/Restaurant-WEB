// Stripe payment strategy (mock)
import { IPayment } from '../interfaces/payment.interface';

export class StripeStrategy {
	async process(payment: IPayment): Promise<'success' | 'failed'> {
		// Mock: random success/fail
		return Math.random() > 0.2 ? 'success' : 'failed';
	}
}
