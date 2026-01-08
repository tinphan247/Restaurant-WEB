import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
	orderId: string;
	amount: number;
	method: PaymentMethod;
}