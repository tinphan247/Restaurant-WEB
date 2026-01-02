import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    table_id: number;

    @Column({ default: 'pending' })
    status: string;

    @Column('numeric', { precision: 12, scale: 2, default: 0 })
    total_amount: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;


    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[];
}