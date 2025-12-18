import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TableEntity } from '../tables/table.entity';
import { QrUtils } from './qr.utils';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(TableEntity)
    private tablesRepository: Repository<TableEntity>,
    private qrUtils: QrUtils,
  ) {}

  async generateQrCode(tableId: string) {
    const table = await this.tablesRepository.findOne({ where: { id: tableId, deletedAt: IsNull() } });
    if (!table) throw new NotFoundException('Table not found');

    if (table.status !== 'active') {
      throw new ForbiddenException('Table is inactive. QR is not available.');
    }

    const token = this.qrUtils.generateToken(table.id, table.tableNumber);
    
    // Lưu token mới vào DB
    table.qrToken = token;
    await this.tablesRepository.save(table);

    return { token, tableNumber: table.tableNumber };
  }

  async verifyQrAccess(token: string) {
    const decoded = this.qrUtils.verifyToken(token);
    if (!decoded) return { valid: false, message: 'Invalid or expired token' };

    // Kiểm tra xem token này có khớp với token đang lưu trong DB không (để hỗ trợ tính năng Invalidate cũ)
    const table = await this.tablesRepository.findOne({ where: { id: decoded.sub, deletedAt: IsNull() } });
    
    if (!table) {
      return { valid: false, message: 'Table not found or deleted' };
    }

    if (table.status !== 'active') {
      return { valid: false, message: 'Table is inactive. QR is not available.' };
    }

    if (!table.qrToken || table.qrToken !== token) {
        return { valid: false, message: 'Token is no longer valid' };
    }

    return { valid: true, tableId: table.id, tableNumber: table.tableNumber };
  }
}