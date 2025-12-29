// DTO for creating payment
export class CreatePaymentDto {
	orderId: string;
	amount: number;
	method: 'stripe' | 'momo';
}
