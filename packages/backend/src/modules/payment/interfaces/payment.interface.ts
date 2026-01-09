import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export interface IPayment {
	id: string;
	orderId: string;
	amount: number;
	method: PaymentMethod;
	status: PaymentStatus;
	momoTransId?: string;
	momoErrorCode?: string;
	momoMessage?: string;
	expiredAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}