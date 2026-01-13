import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from '../../order/entities/order.entity';

export enum PaymentStatus {
	PENDING = 'pending',
	EXPIRED = 'expired',
	SUCCESS = 'success',
	FAILED = 'failed',
}

export enum PaymentMethod {
	STRIPE = 'stripe',
	MOMO = 'momo',
	CASH = 'cash',
	BANK = 'bank',
}

@Entity('payment')
@Index(['orderId'])
@Index(['status'])
@Index(['createdAt'])
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('uuid', { name: 'order_id' })
	orderId: string;

	@ManyToOne(() => OrderEntity, (order) => order.payments)
	@JoinColumn({ name: 'order_id' })
	order: OrderEntity;

	@Column('numeric', { precision: 12, scale: 2 })
	amount: number;

	@Column({
		type: 'enum',
		enum: PaymentMethod,
		default: PaymentMethod.MOMO,
	})
	method: PaymentMethod;

	@Column({
		type: 'enum',
		enum: PaymentStatus,
		default: PaymentStatus.PENDING,
	})
	status: PaymentStatus;

	@Column('varchar', { name: 'momo_trans_id', length: 255, nullable: true })
	momoTransId?: string;

	@Column('varchar', { name: 'momo_error_code', length: 50, nullable: true })
	momoErrorCode?: string;

	@Column('varchar', { name: 'momo_message', length: 500, nullable: true })
	momoMessage?: string;

	@Column('timestamp', { name: 'expired_at', nullable: true })
	expiredAt?: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}