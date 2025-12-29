// Payment entity
export class Payment {
	id: string;
	orderId: string;
	amount: number;
	method: 'stripe' | 'momo';
	status: 'pending' | 'success' | 'failed';
	createdAt: Date;
	updatedAt: Date;
}