import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { MenuItemEntity } from '../../menu-items/entities/menu-item.entity';

@Entity('order_items')
export class OrderItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    order_id: string;

    @Column('uuid')
    menu_item_id: string;

    @Column()
    quantity: number;

    @Column('numeric', { precision: 12, scale: 2 })
    price: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;
   
    @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => MenuItemEntity)
    @JoinColumn({ name: 'menu_item_id' })
    menuItem: MenuItemEntity;
}