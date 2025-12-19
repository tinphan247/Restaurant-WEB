import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import archiver from 'archiver';

@Injectable()
export class ZipGeneratorService {
  async generate(tables: any[], res: Response) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=all-qr-codes.zip',
    );

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.pipe(res);

    // Generate full QR URL for each table
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    for (const table of tables) {
      const qrUrl = `${baseUrl}/menu?token=${table.qrToken || table.id}`;
      const buffer = await QRCode.toBuffer(qrUrl);
      archive.append(buffer, { name: `Table-${table.tableNumber}.png` });
    }

    await archive.finalize();
  }
}
