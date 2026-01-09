import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { IPayment } from './interfaces/payment.interface';

@Injectable()
export class PaymentRepository {
	private readonly logger = new Logger(PaymentRepository.name);

	constructor(
		@InjectRepository(Payment)
		private repo: Repository<Payment>,
	) {}

	async create(payment: IPayment): Promise<IPayment | null> {
		try {
			const entity = this.repo.create(payment);
			const saved = await this.repo.save(entity);
			this.logger.debug(`[SQL] INSERT payment - id=${saved.id}, orderId=${saved.orderId}`);
			return saved;
		} catch (error) {
			this.logger.error(`[SQL_ERROR] INSERT payment failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findAll(): Promise<IPayment[]> {
		try {
			return await this.repo.find();
		} catch (error) {
			this.logger.error(`[SQL_ERROR] SELECT all payments failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findOne(id: string): Promise<IPayment | null> {
		try {
			return await this.repo.findOne({ where: { id } });
		} catch (error) {
			this.logger.error(`[SQL_ERROR] SELECT payment by id failed - id=${id}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findByOrderId(orderId: string): Promise<IPayment | null> {
		try {
			return await this.repo.findOne({ where: { orderId } });
		} catch (error) {
			this.logger.error(`[SQL_ERROR] SELECT payment by orderId failed - orderId=${orderId}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async updateStatus(id: string, status: PaymentStatus, updates?: Partial<IPayment>): Promise<IPayment | null> {
		try {
			const result = await this.repo.update(id, {
				status,
				updatedAt: new Date(),
				...updates,
			});

			if (result.affected === 0) {
				this.logger.warn(`[SQL_WARNING] UPDATE payment rows_affected=0 - id=${id}, status=${status}`);
			return null;
			}

			this.logger.debug(`[SQL] UPDATE payment - id=${id}, status=${status}, rows_affected=${result.affected}`);
			return await this.repo.findOne({ where: { id } });
		} catch (error) {
			this.logger.error(`[SQL_ERROR] UPDATE payment status failed - id=${id}, status=${status}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findPendingOlderThan(minutes: number): Promise<IPayment[]> {
		try {
			const threshold = new Date(Date.now() - minutes * 60 * 1000);
			const payments = await this.repo.find({
				where: {
					status: PaymentStatus.PENDING,
					createdAt: LessThan(threshold),
				},
			});
			this.logger.debug(`[SQL] SELECT pending payments older than ${minutes}min - count=${payments.length}`);
			return payments;
		} catch (error) {
			this.logger.error(`[SQL_ERROR] SELECT pending older payments failed - error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async findExpiredOlderThan(minutes: number): Promise<IPayment[]> {
		try {
			const threshold = new Date(Date.now() - minutes * 60 * 1000);
			const payments = await this.repo.find({
				where: {
					status: PaymentStatus.EXPIRED,
					expiredAt: LessThan(threshold),
				},
			});
			this.logger.debug(`[SQL] SELECT expired payments older than ${minutes}min - count=${payments.length}`);
			return payments;
		} catch (error) {
			this.logger.error(`[SQL_ERROR] SELECT expired older payments failed - error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async update(id: string, updates: Partial<IPayment>): Promise<IPayment | null> {
		try {
			const result = await this.repo.update(id, {
				...updates,
				updatedAt: new Date(),
			});

			if (result.affected === 0) {
				this.logger.warn(`[SQL_WARNING] UPDATE payment rows_affected=0 - id=${id}`);
			return null;
			}

			this.logger.debug(`[SQL] UPDATE payment - id=${id}, rows_affected=${result.affected}`);
			return await this.repo.findOne({ where: { id } });
		} catch (error) {
			this.logger.error(`[SQL_ERROR] UPDATE payment failed - id=${id}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	async remove(id: string): Promise<boolean> {
		try {
			const result = await this.repo.delete(id);
			this.logger.debug(`[SQL] DELETE payment - id=${id}, rows_affected=${result.affected}`);
			return (result.affected || 0) > 0;
		} catch (error) {
			this.logger.error(`[SQL_ERROR] DELETE payment failed - id=${id}, error=${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}
}
