import { Entity, PrimaryColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { MenuItemEntity } from '../../menu-items/entities/menu-item.entity';
import { ModifierGroupEntity } from './modifier-group.entity';

/**
 * Entity cho bảng trung gian Menu Item - Modifier Group
 * Quan hệ Many-to-Many giữa MenuItem và ModifierGroup
 * Một item có thể có nhiều modifier groups
 * Một modifier group có thể được dùng cho nhiều items
 */
@Entity('menu_item_modifier_groups')
export class MenuItemModifierGroupEntity extends BaseEntity {
  // Composite Primary Key
  @PrimaryColumn({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @PrimaryColumn({ name: 'modifier_group_id', type: 'uuid' })
  modifierGroupId: string;

  // Relations
  @ManyToOne(() => MenuItemEntity, item => item.itemModifierGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem?: MenuItemEntity;

  @ManyToOne(() => ModifierGroupEntity, group => group.menuItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifier_group_id' })
  modifierGroup?: ModifierGroupEntity;
}
