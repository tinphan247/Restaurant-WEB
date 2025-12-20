import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfGeneratorService {
  private getFontPath(): string {
    // Ưu tiên đường dẫn assets ở root (Vercel)
    let fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Regular.ttf');
    
    if (fs.existsSync(fontPath)) return fontPath;

    // Fallback: Thử tìm trong dist/assets (Local build)
    fontPath = path.join(process.cwd(), 'dist', 'assets', 'fonts', 'Roboto-Regular.ttf');
    if (fs.existsSync(fontPath)) return fontPath;

    // Fallback: Thử tìm tương đối với file hiện tại (Development)
    fontPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'fonts', 'Roboto-Regular.ttf');
    if (fs.existsSync(fontPath)) return fontPath;

    console.warn('Could not find Roboto-Regular.ttf in any expected location.');
    return 'Helvetica'; // Fallback font
  }

  async generate(table: any, res: Response) {
    const fontPath = this.getFontPath();

    // Generate full QR URL with both tableId and token (requirement 2.1)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${baseUrl}/menu?table=${table.id}&token=${table.qrToken || ''}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    if (fontPath !== 'Helvetica') {
        try {
            doc.font(fontPath);
        } catch (e) {
            console.warn("Error loading font:", e.message);
        }
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

  // Generate bulk PDF with all tables (requirement 3.2 - Batch Operations)
  async generateBulk(tables: any[], res: Response) {
    const fontPath = this.getFontPath();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const doc = new PDFDocument({
      size: 'A4',
      margin: 20,
    });

    if (fontPath !== 'Helvetica') {
        try {
            doc.font(fontPath);
        } catch (e) {
            console.warn("Error loading font:", e.message);
        }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=All-QR-Codes.pdf',
    );

    doc.pipe(res);

    // Title page
    doc
      .fontSize(24)
      .text('Restaurant QR Codes', { align: 'center' });

    doc.moveDown(1);
    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleString('vi-VN')}`, {
        align: 'center',
      });

    doc.moveDown(2);
    doc
      .fontSize(14)
      .text(`Total Tables: ${tables.length}`, {
        align: 'center',
      });

    doc.addPage();

    // Grid layout: 2 columns x 2 rows per page (4 QR codes per page)
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const cols = 2;
    const rows = 2;
    const cellWidth = contentWidth / cols;
    const cellHeight = contentHeight / rows;

    const qrSize = 120;
    const tableInfoHeight = 50;

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const qrUrl = `${baseUrl}/menu?table=${table.id}&token=${table.qrToken || ''}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);

      // Calculate position in grid
      const row = i % (cols * rows);
      const col = row % cols;
      const rowNum = Math.floor(row / cols);

      // Add new page if needed
      if (i > 0 && row === 0) {
        doc.addPage();
      }

      // Calculate cell position
      const cellX = margin + col * cellWidth;
      const cellY = margin + rowNum * cellHeight;

      // Draw border around cell
      doc
        .rect(cellX + 5, cellY + 5, cellWidth - 10, cellHeight - 10)
        .stroke();

      // Table info (without bold, just use regular font)
      doc
        .fontSize(12)
        .text(`Table ${table.tableNumber}`, cellX + 10, cellY + 10, {
          width: cellWidth - 20,
        });

      // Location
      doc
        .fontSize(9)
        .text(`${table.location}`, cellX + 10, cellY + 28, {
          width: cellWidth - 20,
        });

      // QR Code (centered in cell)
      const qrX = cellX + (cellWidth - qrSize) / 2;
      const qrY = cellY + tableInfoHeight;

      doc.image(qrDataUrl, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });

      // Scan instruction
      doc
        .fontSize(8)
        .text('Scan to Order', cellX + 10, cellY + cellHeight - 20, {
          width: cellWidth - 20,
          align: 'center',
        });
    }

    doc.end();
  }
}
