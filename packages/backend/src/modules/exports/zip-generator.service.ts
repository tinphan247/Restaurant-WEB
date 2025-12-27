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

    // Generate full QR URL with both tableId and token for each table (requirement 2.1)
    const baseUrl = process.env.FRONTEND_URL || 'https://restaurant-web-2t3m.vercel.app';

    for (const table of tables) {
      const qrUrl = `${baseUrl}/menu?table=${table.id}&token=${table.qrToken || ''}`;
      const buffer = await QRCode.toBuffer(qrUrl);
      archive.append(buffer, { name: `Table-${table.tableNumber}.png` });
    }

    await archive.finalize();
  }
}
