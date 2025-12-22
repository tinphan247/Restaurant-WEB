import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, BaseEntity } from 'typeorm';
import type { ModifierGroup as IModifierGroup, ModifierGroupSelectionType, ModifierStatus } from '../../../../../../shared/types/menu';
import * as Modifiers from './modifier-option.entity';
import * as MenuItems from '../../menu-items/entities/menu-item.entity';

/**
 * Entity cho Modifier Group
 * Đại diện cho một nhóm tùy chọn modifier (ví dụ: Size, Topping)
 */
@Entity('modifier_groups')
export class ModifierGroupEntity extends BaseEntity implements IModifierGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Restaurant ID - luôn lấy từ session/token, không tin client
  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  // Tên nhóm modifier (ví dụ: "Size", "Extra Toppings")
  @Column({ length: 100 })
  name: string;

  // Loại lựa chọn: single (chọn 1) hoặc multiple (chọn nhiều)
  @Column({
    name: 'selection_type',
    type: 'text',
    enum: ['single', 'multiple'],
  })
  selectionType: ModifierGroupSelectionType;

  // Bắt buộc phải chọn hay không
  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  // Số lựa chọn tối thiểu (chỉ áp dụng khi selectionType = 'multiple')
  @Column({ name: 'min_selections', type: 'int', nullable: true })
  minSelections?: number;

  // Số lựa chọn tối đa (chỉ áp dụng khi selectionType = 'multiple')
  @Column({ name: 'max_selections', type: 'int', nullable: true })
  maxSelections?: number;

  // Thứ tự hiển thị
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder?: number;

  // Trạng thái: active hoặc inactive
  @Column({
    type: 'text',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: ModifierStatus;

  // Relation với ModifierOption (1 group có nhiều options)
  @OneToMany(() => Modifiers.ModifierOptionEntity, option => option.group, { cascade: true })
  options?: Modifiers.ModifierOptionEntity[];

  // Relation với MenuItem (Many-to-Many)
  @ManyToMany(() => MenuItems.MenuItemEntity, item => item.modifierGroups)
  menuItems?: MenuItems.MenuItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
