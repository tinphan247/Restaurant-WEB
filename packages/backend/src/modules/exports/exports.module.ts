import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { ZipGeneratorService } from './zip-generator.service';
import { TablesModule } from '../../tables/tables.module';

@Module({
  imports: [TablesModule],
  controllers: [ExportController],
  providers: [PdfGeneratorService, ZipGeneratorService],
  exports: [PdfGeneratorService, ZipGeneratorService],
})
export class ExportsModule {}
