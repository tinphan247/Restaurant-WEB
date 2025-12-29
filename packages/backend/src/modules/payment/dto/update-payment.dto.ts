// DTO for updating payment
export class UpdatePaymentDto {
	amount?: number;
	method?: 'stripe' | 'momo';
	status?: 'pending' | 'success' | 'failed';
}
