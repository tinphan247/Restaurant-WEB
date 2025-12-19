import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PdfGeneratorService } from './pdf-generator.service';
import { ZipGeneratorService } from './zip-generator.service';
import { TableService } from '../../tables/tables.service';

@Controller('admin/tables')
export class ExportController {
  constructor(
    private readonly pdfService: PdfGeneratorService,
    private readonly zipService: ZipGeneratorService,
    private readonly tableService: TableService,
  ) {}

  @Get(':id/qr/download')
  async downloadOne(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const table = await this.tableService.findOne(id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    return this.pdfService.generate(table, res);
  }

  @Get('qr/download-all')
  async downloadAll(@Res() res: Response) {
    const { data: tables } = await this.tableService.findAll({});
    return this.zipService.generate(tables, res);
  }
}
