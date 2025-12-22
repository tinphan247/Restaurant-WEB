import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import type { ModifierOption as IModifierOption, ModifierStatus } from '../../../../../../shared/types/menu';
import * as Groups from './modifier-group.entity';

/**
 * Entity cho Modifier Option
 * Đại diện cho một lựa chọn cụ thể trong group (ví dụ: Small, Medium, Large)
 */
@Entity('modifier_options')
export class ModifierOptionEntity extends BaseEntity implements IModifierOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign key tới modifier group
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  // Tên option (ví dụ: "Small", "Extra Cheese", "No Onion")
  @Column({ length: 100 })
  name: string;

  // Giá điều chỉnh (có thể là 0, phải >= 0)
  // Ví dụ: Small = +0, Medium = +1.5, Large = +3.0
  @Column({ name: 'price_adjustment', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceAdjustment: number;

  // Trạng thái: active hoặc inactive
  @Column({
    type: 'text',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: ModifierStatus;

  // Relation với ModifierGroup (nhiều options thuộc 1 group)
  @ManyToOne(() => Groups.ModifierGroupEntity, group => group.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group?: Groups.ModifierGroupEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
