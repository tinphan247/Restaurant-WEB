export interface Payment {
	id: string;
	orderId: string;
	amount: number;
	method: 'stripe' | 'momo' | 'cash' | 'bank';
	status: 'pending' | 'success' | 'failed';
	createdAt: string;
	updatedAt: string;
}

export interface CreatePaymentDto {
	orderId: string;
	amount: number;
	method: 'stripe' | 'momo' | 'cash' | 'bank';
}
