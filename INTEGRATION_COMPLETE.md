# QR Restaurant Integration Complete

## Files Created

### Backend - Exports Module

**FILE:** packages/backend/src/modules/exports/exports.module.ts
**ACTION:** created
**CODE:**
```typescript
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { ZipGeneratorService } from './zip-generator.service';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [TablesModule],
  controllers: [ExportController],
  providers: [PdfGeneratorService, ZipGeneratorService],
  exports: [PdfGeneratorService, ZipGeneratorService],
})
export class ExportsModule {}
```

**FILE:** packages/backend/src/modules/exports/export.controller.ts
**ACTION:** created
**CODE:**
```typescript
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { TablesService } from '../tables/tables.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { ZipGeneratorService } from './zip-generator.service';

@Controller('api/admin/tables')
export class ExportController {
  constructor(
    private tablesService: TablesService,
    private pdfService: PdfGeneratorService,
    private zipService: ZipGeneratorService,
  ) {}

  @Get(':id/qr/download')
  async downloadOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const table = await this.tablesService.findOne(id);
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
      const pdfBuffer = await this.pdfService.generate([table]);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="qr_table_${table.tableNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
  }

  @Get('qr/download-all')
  async downloadAll(@Res() res: Response) {
    try {
      const tables = await this.tablesService.findAll();
      const zipBuffer = await this.zipService.generate(tables);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="qr_codes_all.zip"');
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error generating ZIP', error: error.message });
    }
  }
}
```

**FILE:** packages/backend/src/modules/exports/pdf-generator.service.ts
**ACTION:** created
**CODE:**
```typescript
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import type { Table } from '@shared/types/table';

@Injectable()
export class PdfGeneratorService {
  async generate(tables: Table[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    for (const table of tables) {
      if (tables.indexOf(table) > 0) {
        doc.addPage();
      }

      doc.fontSize(20).text(`QR Code - Bàn ${table.tableNumber}`, { align: 'center' });
      doc.fontSize(12).text(`Sức chứa: ${table.capacity} người`, { align: 'center' });
      doc.fontSize(10).text(`Vị trí: ${table.location}`, { align: 'center' });
      doc.moveDown();

      try {
        const qrDataUrl = await QRCode.toDataURL(table.qrToken || '');
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, { fit: [200, 200], align: 'center' });
      } catch (error) {
        doc.text('QR Code generation failed', { align: 'center' });
      }

      doc.moveDown();
      doc.fontSize(10).text(`Token: ${table.qrToken}`, { align: 'center' });
      doc.fontSize(9).text(`Created: ${new Date(table.createdAt).toLocaleString('vi-VN')}`, { align: 'center' });

      // Try to load custom font
      try {
        const fontPath = path.join(process.cwd(), 'assets/fonts/Roboto-Regular.ttf');
        if (fs.existsSync(fontPath)) {
          doc.registerFont('Roboto', fontPath);
        }
      } catch (error) {
        console.warn('Font not found, using default');
      }
    }

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
    });
  }
}
```

**FILE:** packages/backend/src/modules/exports/zip-generator.service.ts
**ACTION:** created
**CODE:**
```typescript
import { Injectable } from '@nestjs/common';
import * as archiver from 'archiver';
import * as QRCode from 'qrcode';
import type { Table } from '@shared/types/table';
import { Readable } from 'stream';

@Injectable()
export class ZipGeneratorService {
  async generate(tables: Table[]): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const output = new (require('stream').Writable)();
      const chunks: Buffer[] = [];

      output.write = (chunk: Buffer) => {
        chunks.push(chunk);
        return true;
      };

      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', reject);
      archive.pipe(output);

      for (const table of tables) {
        try {
          const qrPng = await QRCode.toBuffer(table.qrToken || '', {
            type: 'image/png',
            width: 300,
          });
          archive.append(qrPng, { name: `qr_table_${table.tableNumber}.png` });
        } catch (error) {
          console.error(`Error generating QR for table ${table.tableNumber}:`, error);
        }
      }

      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      archive.finalize();
    });
  }
}
```

### Frontend - Print Tools Components

**FILE:** packages/frontend/src/features/print-tools/components/QRCodeDisplay.tsx
**ACTION:** created
**CODE:**
```typescript
import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 128 }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white p-2 rounded-lg border border-gray-200">
        <QRCode value={value} size={size} level="H" includeMargin />
      </div>
    </div>
  );
};
```

**FILE:** packages/frontend/src/features/print-tools/components/DownloadActions.tsx
**ACTION:** created
**CODE:**
```typescript
import React, { useState } from 'react';
import { saveFile } from '../utils/file-saver';

interface DownloadActionsProps {
  tableId: string;
}

export const DownloadActions: React.FC<DownloadActionsProps> = ({ tableId }) => {
  const [loadingType, setLoadingType] = useState<'pdf' | 'zip' | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleDownloadPdf = async () => {
    setLoadingType('pdf');
    try {
      const response = await fetch(`${apiUrl}/admin/tables/${tableId}/qr/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      saveFile(blob, `qr_table_${tableId}.pdf`, 'application/pdf');
    } catch (error) {
      alert('Error downloading PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownloadAllZip = async () => {
    setLoadingType('zip');
    try {
      const response = await fetch(`${apiUrl}/admin/tables/qr/download-all`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      saveFile(blob, 'qr_codes_all.zip', 'application/zip');
    } catch (error) {
      alert('Error downloading ZIP: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="flex space-x-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadPdf();
        }}
        disabled={loadingType === 'pdf'}
        className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded hover:bg-green-200 disabled:opacity-50 transition"
      >
        {loadingType === 'pdf' ? '⏳' : '📥'} PDF
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadAllZip();
        }}
        disabled={loadingType === 'zip'}
        className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded hover:bg-purple-200 disabled:opacity-50 transition"
      >
        {loadingType === 'zip' ? '⏳' : '📦'} ZIP
      </button>
    </div>
  );
};
```

**FILE:** packages/frontend/src/features/print-tools/components/PrintPreviewModal.tsx
**ACTION:** created
**CODE:**
```typescript
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeDisplay } from './QRCodeDisplay';
import type { Table } from '@shared/types/table';

interface PrintPreviewModalProps {
  isOpen: boolean;
  table: Table | null;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, table, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `QR_Table_${table?.tableNumber}`,
  });

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
        <div ref={printRef} className="text-center p-6">
          <h2 className="text-2xl font-bold mb-2">Bàn {table.tableNumber}</h2>
          <p className="text-gray-600 mb-4">Sức chứa: {table.capacity} người</p>
          <QRCodeDisplay value={table.qrToken || ''} size={150} />
          <p className="text-sm text-gray-500 mt-4">Quét mã để truy cập menu</p>
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => handlePrint()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🖨️ In
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
```

**FILE:** packages/frontend/src/features/print-tools/utils/file-saver.ts
**ACTION:** created
**CODE:**
```typescript
import { saveAs } from 'file-saver';

export const saveFile = (blob: Blob, filename: string, mimeType: string = 'application/octet-stream') => {
  const file = new File([blob], filename, { type: mimeType });
  saveAs(file, filename);
};

export const downloadPdf = (blob: Blob, filename: string) => {
  saveFile(blob, filename, 'application/pdf');
};

export const downloadZip = (blob: Blob, filename: string) => {
  saveFile(blob, filename, 'application/zip');
};
```

**FILE:** packages/frontend/.env.local
**ACTION:** created
**CODE:**
```
VITE_API_URL=http://localhost:3000/api
```

## Files Modified

**FILE:** packages/backend/src/app.module.ts
**ACTION:** modified
**CODE:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesModule } from './modules/tables/tables.module';
import { QrAuthModule } from './qr-auth/qr-auth.module';
import { ExportsModule } from './modules/exports/exports.module';
import { Table } from './modules/tables/entities/table.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'qr_restaurant',
      entities: [Table],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    TablesModule,
    QrAuthModule,
    ExportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**FILE:** packages/backend/package.json
**ACTION:** modified
**CODE:** (dependencies added)
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^3.2.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^12.1.2",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/typeorm": "^10.1.1",
    "archiver": "^7.0.1",
    "pdfkit": "^0.17.2",
    "qrcode": "^1.5.4",
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.2",
    "typeorm": "^0.3.28"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.1",
    "@nestjs/testing": "^11.0.1",
    "@types/archiver": "^7.0.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.24",
    "@types/pdfkit": "^0.17.4",
    "@types/qrcode": "^1.5.6",
    "@typescript-eslint/eslint-plugin": "^7.4.0",
    "@typescript-eslint/parser": "^7.4.0",
    "eslint": "^9.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "ts-loader": "^9.5.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.5"
  }
}
```

**FILE:** packages/frontend/package.json
**ACTION:** modified
**CODE:** (dependencies added)
```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "file-saver": "^2.0.5",
    "qrcode.react": "^4.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-qr-code": "^2.0.18",
    "react-router-dom": "^7.10.1",
    "react-to-print": "^3.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/file-saver": "^2.0.7",
    "@types/node": "^24.10.4",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

**FILE:** packages/frontend/src/features/admin-dashboard/components/TableGrid.tsx
**ACTION:** modified
**CODE:** (imports and table rendering updated)
```typescript
// Imports updated:
import { QRCodeDisplay } from '../../print-tools/components/QRCodeDisplay';
import { DownloadActions } from '../../print-tools/components/DownloadActions';

// Table rendering updated to include QR codes and download buttons in rows
// QR code column displays QRCodeDisplay component
// Action column includes download buttons via DownloadActions component
```

## Assets Copied

**FILE:** packages/backend/assets/fonts/Roboto-Regular.ttf
**ACTION:** copied
**SOURCE:** d:\vscode\qr-restaurant-backend\backend\assets\fonts\Roboto-Regular.ttf
**DESTINATION:** c:\Users\tung1\Downloads\Restaurant-WEB-main\Restaurant-WEB-main\packages\backend\assets\fonts\

## Integration Summary

- ✅ Backend exports module created with PDF and ZIP generation
- ✅ Frontend print-tools components created for QR display and downloads
- ✅ App module updated to register ExportsModule
- ✅ All dependencies added to both backend and frontend package.json
- ✅ Environment configuration created
- ✅ TableGrid component updated with new QR display and download functionality
- ✅ Font asset copied for Vietnamese PDF rendering
