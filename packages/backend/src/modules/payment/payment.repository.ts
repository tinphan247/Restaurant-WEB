// Payment repository (mock DB)
import { IPayment } from './interfaces/payment.interface';

export class PaymentRepository {
	private payments: IPayment[] = [];

	async create(payment: IPayment): Promise<IPayment> {
		this.payments.push(payment);
		return payment;
	}

	async findAll(): Promise<IPayment[]> {
		return this.payments;
	}

	async findOne(id: string): Promise<IPayment | undefined> {
		return this.payments.find(p => p.id === id);
	}

	async update(id: string, update: Partial<IPayment>): Promise<IPayment | undefined> {
		const payment = await this.findOne(id);
		if (payment) {
			Object.assign(payment, update);
		}
		return payment;
	}

	async remove(id: string): Promise<boolean> {
		const idx = this.payments.findIndex(p => p.id === id);
		if (idx !== -1) {
			this.payments.splice(idx, 1);
			return true;
		}
		return false;
	}
}
