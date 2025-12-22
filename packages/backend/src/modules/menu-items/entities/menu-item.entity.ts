import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, BaseEntity } from 'typeorm';
import type { MenuItem as IMenuItem, MenuItemStatus } from '../../../../../../shared/types/menu';
import { MenuCategoryEntity } from '../../menu-categories/entities/menu-category.entity';
import { ModifierGroupEntity } from '../../modifiers/entities/modifier-group.entity';
import { MenuItemModifierGroupEntity } from '../../modifiers/entities/menu-item-modifier-group.entity';
import { MenuItemPhotoEntity } from '../../menu-item-photos/entities/menu-item-photo.entity';

/**
 * Entity cho Menu Item (tạm thời cho Người 3, Người 2 sẽ hoàn thiện)
 * Đại diện cho một món ăn trong menu
 */
@Entity('menu_items')
export class MenuItemEntity extends BaseEntity implements IMenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'prep_time_minutes', type: 'int', nullable: true })
  prepTimeMinutes?: number;

  @Column({
    type: 'text',
    enum: ['available', 'unavailable', 'sold_out'],
    default: 'available',
  })
  status: MenuItemStatus;

  @Column({ name: 'is_chef_recommended', type: 'boolean', default: false })
  isChefRecommended?: boolean;

  @Column({ type: 'int', default: 0 })
  popularity?: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted?: boolean;

  // Virtual field - sẽ được populate từ photos relation
  primaryPhotoUrl?: string | null;

  // Relations
  @ManyToOne(() => MenuCategoryEntity, category => category.items)
  @JoinColumn({ name: 'category_id' })
  category?: MenuCategoryEntity;

  @OneToMany(() => MenuItemPhotoEntity, photo => photo.menuItem, { cascade: true })
  photos?: MenuItemPhotoEntity[];

  @ManyToMany(() => ModifierGroupEntity, group => group.menuItems)
  @JoinTable({
    name: 'menu_item_modifier_groups',
    joinColumn: { name: 'menu_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'modifier_group_id', referencedColumnName: 'id' },
  })
  modifierGroups?: ModifierGroupEntity[];

  @OneToMany(() => MenuItemModifierGroupEntity, link => link.menuItem)
  itemModifierGroups?: MenuItemModifierGroupEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
