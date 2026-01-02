import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TablesModule } from './tables/tables.module';
import { QrAuthModule } from './qr-auth/qr-auth.module';
import { ExportsModule } from './modules/exports/exports.module';
import { GuestMenuModule } from './modules/guest-menu/guest-menu.module';
import { ModifierModule } from './modules/modifiers/modifiers.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { MenuCategoriesModule } from './modules/menu-categories/menu-categories.module';
import { MenuItemPhotosModule } from './modules/menu-item-photos/menu-item-photos.module';

import { TableEntity } from './tables/table.entity';
import { MenuCategoryEntity } from './modules/menu-categories/entities/menu-category.entity';
import { MenuItemEntity } from './modules/menu-items/entities/menu-item.entity';
import { MenuItemPhotoEntity } from './modules/menu-item-photos/entities/menu-item-photo.entity';
import { ModifierGroupEntity } from './modules/modifiers/entities/modifier-group.entity';
import { ModifierOptionEntity } from './modules/modifiers/entities/modifier-option.entity';
import { MenuItemModifierGroupEntity } from './modules/modifiers/entities/menu-item-modifier-group.entity';
import { AuthModule } from './modules/auth/auth.module'; // Thêm dòng này
import { UserModule } from './modules/user/user.module'; // Thêm dòng này
import { User } from './modules/user/user.entity';      // Thêm dòng này

import { OrderModule } from './modules/order/order.module';
import  { OrderEntity } from './modules/order/entities/order.entity';
import { OrderItemEntity } from './modules/order/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [
          User,
          AuthModule,
          TableEntity,
          MenuCategoryEntity,
          MenuItemEntity,
          MenuItemPhotoEntity,
          ModifierGroupEntity,
          ModifierOptionEntity,
          MenuItemModifierGroupEntity,
          OrderEntity,
          OrderItemEntity,

        ],
        // Tự động tạo bảng nếu chưa có (chỉ nên dùng khi mới deploy hoặc dev)
        // Set biến môi trường DB_SYNC=true trên Vercel để kích hoạt
        synchronize: config.get<string>('DB_SYNC') === 'true',
        // SSL is disabled for local/non-SSL servers
      }),
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      signOptions: { expiresIn: '1d' },
    }),

    TablesModule,
    QrAuthModule,
    ExportsModule,
    GuestMenuModule,
    ModifierModule,
    MenuItemsModule,
    MenuCategoriesModule, 
    MenuItemPhotosModule, 
    AuthModule, // THÊM MODULE VÀO ĐÂY
    UserModule, // THÊM MODULE VÀO ĐÂY
    OrderModule,
  ],
})
export class AppModule {}