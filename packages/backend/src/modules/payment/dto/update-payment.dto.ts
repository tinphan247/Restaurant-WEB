import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class UpdatePaymentDto {
	amount?: number;
	method?: PaymentMethod;
	status?: PaymentStatus;
	momoTransId?: string;
	momoErrorCode?: string;
	momoMessage?: string;
}