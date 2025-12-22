import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { MenuItemPhoto as IMenuItemPhoto } from '../../../../../../shared/types/menu';
import { MenuItemEntity } from '../../menu-items/entities/menu-item.entity';

/**
 * Entity cho Menu Item Photo (tạm thời cho Người 3, sẽ được hoàn thiện hơn)
 * Đại diện cho ảnh của món ăn
 */
@Entity('menu_item_photos')
export class MenuItemPhotoEntity extends BaseEntity implements IMenuItemPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  // Relation với MenuItem
  @ManyToOne(() => MenuItemEntity, item => item.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem?: MenuItemEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
