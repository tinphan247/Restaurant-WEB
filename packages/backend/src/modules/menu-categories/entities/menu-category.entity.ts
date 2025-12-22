import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm';
import type { MenuCategory as IMenuCategory, CategoryStatus } from '../../../../../../shared/types/menu';
import { MenuItemEntity } from '../../menu-items/entities/menu-item.entity';

/**
 * Entity cho Menu Category (tạm thời cho Người 3, Người 1 sẽ hoàn thiện)
 * Đại diện cho một danh mục món ăn
 */
@Entity('menu_categories')
export class MenuCategoryEntity extends BaseEntity implements IMenuCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({
    type: 'text',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: CategoryStatus;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted?: boolean;

  // Virtual field - số lượng items trong category
  itemCount?: number;

  // Relations
  @OneToMany(() => MenuItemEntity, item => item.category)
  items?: MenuItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
