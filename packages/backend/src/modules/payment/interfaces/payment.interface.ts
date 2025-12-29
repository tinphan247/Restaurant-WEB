// Payment interface
export interface IPayment {
	id: string;
	orderId: string;
	amount: number;
	method: 'stripe' | 'momo';
	status: 'pending' | 'success' | 'failed';
	createdAt: Date;
	updatedAt: Date;
}
