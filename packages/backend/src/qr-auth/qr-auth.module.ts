import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TableEntity } from '../tables/table.entity';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { QrUtils } from './qr.utils';
import { QrVerifyGuard } from './guards/qr-verify.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableEntity]), // Cần truy cập bảng Tables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [QrController],
  providers: [QrService, QrUtils, QrVerifyGuard],
  exports: [QrService, QrUtils, QrVerifyGuard], // Export để dùng ở nơi khác nếu cần
})
export class QrAuthModule {}