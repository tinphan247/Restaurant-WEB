import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierController } from './modifiers.controller';
import { ModifierService } from './modifiers.service';
import { ModifierGroupEntity } from './entities/modifier-group.entity';
import { ModifierOptionEntity } from './entities/modifier-option.entity';
import { MenuItemModifierGroupEntity } from './entities/menu-item-modifier-group.entity';
import { MenuItemEntity } from '../menu-items/entities/menu-item.entity';

/**
 * Module cho Modifier Management
 * Xử lý CRUD cho modifier groups và options
 * Quản lý việc attach/detach modifiers vào menu items
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModifierGroupEntity,
      ModifierOptionEntity,
      MenuItemModifierGroupEntity,
      MenuItemEntity,
    ]),
  ],
  controllers: [ModifierController],
  providers: [ModifierService],
  exports: [ModifierService], // Export để các module khác có thể sử dụng
})
export class ModifierModule {}
