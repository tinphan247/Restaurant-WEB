import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestMenuController } from './guest-menu.controller';
import { GuestMenuService } from './guest-menu.service';
import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { MenuItemEntity } from '../menu-items/entities/menu-item.entity';
import { MenuItemPhotoEntity } from '../menu-item-photos/entities/menu-item-photo.entity';
import { ModifierGroupEntity } from '../modifiers/entities/modifier-group.entity';
import { ModifierOptionEntity } from '../modifiers/entities/modifier-option.entity';

/**
 * Module cho Guest Menu (Public)
 * Xử lý việc hiển thị menu cho khách hàng
 * Không yêu cầu authentication
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuCategoryEntity,
      MenuItemEntity,
      MenuItemPhotoEntity,
      ModifierGroupEntity,
      ModifierOptionEntity,
    ]),
  ],
  controllers: [GuestMenuController],
  providers: [GuestMenuService],
  exports: [GuestMenuService],
})
export class GuestMenuModule {}
