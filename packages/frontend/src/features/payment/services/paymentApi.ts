import type { Payment, CreatePaymentDto } from '../types/payment';
// Mock API call to backend
export const paymentApi = {
	async createPayment(data: CreatePaymentDto): Promise<Payment> {
		// Replace with real API call if needed
		return new Promise(resolve => {
			setTimeout(() => {
				resolve({
					id: Math.random().toString(36).substring(2, 10),
					...data,
					status: Math.random() > 0.2 ? 'success' : 'failed',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});
			}, 1200);
		});
	},
};
