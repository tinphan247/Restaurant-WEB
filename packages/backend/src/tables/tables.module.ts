import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableController } from './tables.controller';
import { TableService } from './tables.service';
import { TableEntity } from './table.entity';
import { QrAuthModule } from '../qr-auth/qr-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableEntity]),
    QrAuthModule,
    // ----------------------------
  ],
  controllers: [TableController],
  providers: [TableService],

  exports: [TypeOrmModule, TableService], 
})
export class TablesModule {}
