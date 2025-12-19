import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import * as path from 'path';

@Injectable()
export class PdfGeneratorService {
  async generate(table: any, res: Response) {
    const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Regular.ttf');

    // Generate full QR URL instead of just the token
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${baseUrl}/menu?token=${table.qrToken || table.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    try {
      doc.font(fontPath);
    } catch (e) {
      console.warn("Font not found, using default:", e.message);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Table-${table.tableNumber}.pdf`,
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text(`Bàn số: ${table.tableNumber}`, {
        align: 'center',
      });

    doc.moveDown(1);

    doc
      .rect(100, 150, 400, 400)
      .stroke();

    doc.image(qrDataUrl, 200, 200, {
      width: 200,
      height: 200,
    });

    doc
      .moveDown(15)
      .fontSize(12)
      .text(`Vị trí: ${table.location}`, { align: 'center' });

    doc.end();
  }
}
