// Payment service
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IPayment } from './interfaces/payment.interface';
import { StripeStrategy } from './strategies/stripe.strategy';
import { MoMoStrategy } from './strategies/momo.strategy';

export class PaymentService {
	constructor(
		private readonly repo = new PaymentRepository(),
		private readonly stripe = new StripeStrategy(),
		private readonly momo = new MoMoStrategy()
	) {}

	async create(dto: CreatePaymentDto): Promise<IPayment> {
		const id = Math.random().toString(36).substring(2, 10);
		const now = new Date();
		const payment: IPayment = {
			id,
			orderId: dto.orderId,
			amount: dto.amount,
			method: dto.method,
			status: 'pending',
			createdAt: now,
			updatedAt: now
		};
		// Mock payment processing
		payment.status = dto.method === 'stripe'
			? await this.stripe.process(payment)
			: await this.momo.process(payment);
		payment.updatedAt = new Date();
		return this.repo.create(payment);
	}

	async findAll(): Promise<IPayment[]> {
		return this.repo.findAll();
	}

	async findOne(id: string): Promise<IPayment | undefined> {
		return this.repo.findOne(id);
	}

	async update(id: string, dto: UpdatePaymentDto): Promise<IPayment | undefined> {
		return this.repo.update(id, { ...dto, updatedAt: new Date() });
	}

	async remove(id: string): Promise<boolean> {
		return this.repo.remove(id);
	}
}
