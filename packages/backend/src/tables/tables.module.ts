import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableController } from './tables.controller';
import { TableService } from './tables.service';
import { TableEntity } from './table.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([TableEntity]),
    // ----------------------------
  ],
  controllers: [TableController],
  providers: [TableService],

  exports: [TypeOrmModule, TableService], 
})
export class TablesModule {}
