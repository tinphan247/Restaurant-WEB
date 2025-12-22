import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { QrService } from '../qr.service';

@Injectable()
export class QrVerifyGuard implements CanActivate {
  constructor(private readonly qrService: QrService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Lấy token từ query param hoặc header
    const token = request.query?.token || request.headers['x-qr-token'];
    
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    const result = await this.qrService.verifyQrAccess(token);
    
    if (!result.valid) {
      throw new UnauthorizedException(result.message || 'Token không hợp lệ hoặc đã hết hạn');
    }

    // Gắn thông tin bàn vào request để sử dụng trong controller
    request.tableInfo = {
      tableId: result.tableId,
      tableNumber: result.tableNumber,
    };

    return true;
  }
}
