import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // [IMPORT CẦN THIẾT]
import { ConfigModule, ConfigService } from '@nestjs/config'; // [IMPORT CẦN THIẾT]
import { TablesModule } from './tables/tables.module'; 

@Module({
  imports: [
    // 1. Cấu hình biến môi trường
    ConfigModule.forRoot({
      isGlobal: true, // Để sử dụng ConfigService ở mọi nơi
    }),

    // 2. Thiết lập kết nối TypeORM toàn cục (forRoot)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres', // Hoặc 'mysql', 'mariadb' tùy vào DB của bạn
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        
        // --- CẤU HÌNH QUAN TRỌNG ---
        // Tự động tìm kiếm các entities (models) đã được đăng ký
        autoLoadEntities: true, 
        // Đồng bộ hóa cấu trúc DB với entities (CHỈ DÙNG TRONG DEV!)
        synchronize: true, 
      }),
    }),
    
    // 3. Các modules của ứng dụng
    TablesModule,
    // QrAuthModule (Của Người 2),
    // ExportsModule (Của Người 3),
  ],
})
export class AppModule {}